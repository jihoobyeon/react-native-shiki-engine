#include "onig_regex.h"

#include <algorithm>
#include <cstring>
#include <mutex>
#include <new>
#include <unordered_map>
#include <vector>

#include "onig_context.hpp"
#include "platform_memory.hpp"
#include "regex_memory.hpp"

namespace {

struct GlobalPatternCache {
  std::mutex mutex;
  std::unordered_map<std::string, std::shared_ptr<CachedRegex>> entries;
  size_t total_bytes = 0;
  size_t max_entries = DEFAULT_MAX_CACHE_ENTRIES;
  size_t max_bytes = 0;
  size_t scanner_count = 0;

  size_t effective_max_bytes() {
    if (max_bytes == 0) {
      max_bytes = default_cache_memory_budget();
    }
    return max_bytes;
  }
};

GlobalPatternCache& cache() {
  static GlobalPatternCache instance;
  return instance;
}

void ensure_onig_initialized() {
  static std::once_flag once;
  std::call_once(once, [] {
    OnigEncodingType* encodings[] = {ONIG_ENCODING_UTF8};
    onig_initialize(encodings, 1);
    onig_set_retry_limit_in_match(10'000'000);
    onig_set_retry_limit_in_search(10'000'000);
    onig_set_match_stack_limit_size(32 * 1024 * 1024);
    onig_set_parse_depth_limit(4096);
  });
}

void trim_unlocked(GlobalPatternCache& g, bool force_all_unused) {
  const size_t byte_limit = g.effective_max_bytes();

  auto over_budget = [&] { return g.entries.size() > g.max_entries || g.total_bytes > byte_limit; };

  if (!force_all_unused && !over_budget()) {
    return;
  }

  std::vector<std::pair<std::string, time_t>> unused;
  unused.reserve(g.entries.size());
  for (const auto& [key, value] : g.entries) {
    if (value.use_count() == 1) {
      unused.push_back({key, 0});
    }
  }

  std::sort(unused.begin(), unused.end(), [](const auto& a, const auto& b) { return a.first < b.first; });

  for (const auto& [key, _] : unused) {
    if (!force_all_unused && !over_budget()) {
      break;
    }
    auto it = g.entries.find(key);
    if (it == g.entries.end() || it->second.use_count() != 1) {
      continue;
    }
    g.total_bytes -= it->second->memory_size;
    g.entries.erase(it);
  }
}

std::shared_ptr<CachedRegex> compile_pattern(const char* pattern) {
  regex_t* regex = nullptr;
  OnigErrorInfo einfo;
  const int result = onig_new(
    &regex,
    reinterpret_cast<const OnigUChar*>(pattern),
    reinterpret_cast<const OnigUChar*>(pattern + strlen(pattern)),
    ONIG_OPTION_CAPTURE_GROUP,
    ONIG_ENCODING_UTF8,
    ONIG_SYNTAX_DEFAULT,
    &einfo
  );

  if (result != ONIG_NORMAL || !regex) {
    return nullptr;
  }

  return std::make_shared<CachedRegex>(regex, estimate_pattern_memory(pattern, regex));
}

std::shared_ptr<CachedRegex> get_or_compile(const char* pattern) {
  auto& g = cache();
  std::lock_guard<std::mutex> lock(g.mutex);

  auto it = g.entries.find(pattern);
  if (it != g.entries.end()) {
    return it->second;
  }

  trim_unlocked(g, false);

  auto compiled = compile_pattern(pattern);
  if (!compiled) {
    return nullptr;
  }

  g.total_bytes += compiled->memory_size;
  g.entries.emplace(pattern, compiled);
  trim_unlocked(g, false);
  return compiled;
}

}  // namespace

void configure_pattern_cache(size_t max_entries, size_t max_bytes) {
  auto& g = cache();
  std::lock_guard<std::mutex> lock(g.mutex);
  if (max_entries > 0) {
    g.max_entries = max_entries;
  }
  if (max_bytes > 0) {
    g.max_bytes = max_bytes;
  }
  trim_unlocked(g, false);
}

void clear_unused_pattern_cache(void) {
  auto& g = cache();
  std::lock_guard<std::mutex> lock(g.mutex);
  trim_unlocked(g, true);
}

void trim_pattern_cache(void) {
  auto& g = cache();
  std::lock_guard<std::mutex> lock(g.mutex);
  trim_unlocked(g, false);
}

OnigCacheStats get_pattern_cache_stats(void) {
  auto& g = cache();
  std::lock_guard<std::mutex> lock(g.mutex);
  OnigCacheStats stats{};
  stats.entry_count = g.entries.size();
  stats.estimated_bytes = g.total_bytes;
  stats.scanner_count = g.scanner_count;
  stats.max_entries = g.max_entries;
  stats.max_bytes = g.effective_max_bytes();
  return stats;
}

OnigContext* create_scanner(const char** patterns, int pattern_count, size_t /*max_cache_size*/) {
  if (!patterns || pattern_count < 0) {
    return nullptr;
  }

  ensure_onig_initialized();

  try {
    auto* context = new OnigContext();
    context->pattern_count = pattern_count;
    context->patterns.reserve(static_cast<size_t>(pattern_count));

    std::vector<regex_t*> raw;
    raw.reserve(static_cast<size_t>(pattern_count));

    for (int i = 0; i < pattern_count; i++) {
      auto cached = get_or_compile(patterns[i]);
      if (!cached) {
        delete context;
        return nullptr;
      }
      raw.push_back(cached->regex);
      context->patterns.push_back(std::move(cached));
    }

    if (pattern_count > 0) {
      if (onig_regset_new(&context->regset, pattern_count, raw.data()) != ONIG_NORMAL) {
        delete context;
        return nullptr;
      }
    }

    {
      auto& g = cache();
      std::lock_guard<std::mutex> lock(g.mutex);
      g.scanner_count += 1;
    }

    return context;
  } catch (const std::bad_alloc&) {
    return nullptr;
  }
}

OnigResult* find_next_match(OnigContext* context, const char* text, int start_pos) {
  if (!context || !text || start_pos < 0 || context->pattern_count <= 0 || !context->regset) {
    return nullptr;
  }

  try {
    const int text_length = static_cast<int>(strlen(text));
    if (start_pos > text_length) {
      return nullptr;
    }

    int match_pos = -1;
    const int match_index = onig_regset_search(
      context->regset,
      reinterpret_cast<const OnigUChar*>(text),
      reinterpret_cast<const OnigUChar*>(text + text_length),
      reinterpret_cast<const OnigUChar*>(text + start_pos),
      reinterpret_cast<const OnigUChar*>(text + text_length),
      ONIG_REGSET_REGEX_LEAD,
      ONIG_OPTION_NONE,
      &match_pos
    );

    if (match_index < 0 || match_pos < 0) {
      return nullptr;
    }

    OnigRegion* region = onig_regset_get_region(context->regset, match_index);
    if (!region) {
      return nullptr;
    }

    auto* result = new OnigResult();
    result->pattern_index = match_index;
    result->match_start = region->beg[0];
    result->match_end = region->end[0];
    result->capture_count = region->num_regs;
    result->capture_indices = new int[static_cast<size_t>(result->capture_count) * 2];

    for (int j = 0; j < region->num_regs; j++) {
      result->capture_indices[j * 2] = region->beg[j];
      result->capture_indices[j * 2 + 1] = region->end[j];
    }

    return result;
  } catch (const std::bad_alloc&) {
    return nullptr;
  }
}

void free_result(OnigResult* result) {
  if (result) {
    delete[] result->capture_indices;
    delete result;
  }
}

void free_scanner(OnigContext* context) {
  if (!context) {
    return;
  }

  if (context->regset) {
    onig_regset_free(context->regset);
    context->regset = nullptr;
  }

  context->patterns.clear();

  {
    auto& g = cache();
    std::lock_guard<std::mutex> lock(g.mutex);
    if (g.scanner_count > 0) {
      g.scanner_count -= 1;
    }
  }

  delete context;
}
