#import "NativeShikiEngineModule.h"

#include "onig_regex.h"

#if __has_include(<ReactCommon/CxxTurboModuleUtils.h>)
#import <ReactCommon/CxxTurboModuleUtils.h>
#import <UIKit/UIKit.h>

@interface OnLoad : NSObject
@end

@implementation OnLoad

+ (void)load {
  facebook::react::registerCxxModuleToGlobalModuleMap(
      std::string(facebook::react::NativeShikiEngineModule::kModuleName),
      [](std::shared_ptr<facebook::react::CallInvoker> jsInvoker) {
        return std::make_shared<facebook::react::NativeShikiEngineModule>(
            jsInvoker);
      });

  [[NSNotificationCenter defaultCenter]
      addObserverForName:UIApplicationDidReceiveMemoryWarningNotification
                  object:nil
                   queue:[NSOperationQueue mainQueue]
              usingBlock:^(__unused NSNotification *note) {
                trim_pattern_cache();
              }];
}

@end

#else
#import <React/RCTBridgeModule.h>
#import <ReactCommon/RCTTurboModule.h>
#import <UIKit/UIKit.h>

@interface ShikiEngine : NSObject <RCTBridgeModule, RCTTurboModule>
@end

@implementation ShikiEngine

RCT_EXPORT_MODULE(ShikiEngine)

+ (void)initialize {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    [[NSNotificationCenter defaultCenter]
        addObserverForName:UIApplicationDidReceiveMemoryWarningNotification
                    object:nil
                     queue:[NSOperationQueue mainQueue]
                usingBlock:^(__unused NSNotification *note) {
                  trim_pattern_cache();
                }];
  });
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeShikiEngineModule>(
      params.jsInvoker);
}

@end

#endif
