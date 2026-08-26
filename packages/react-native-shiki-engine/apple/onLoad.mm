#import "NativeShikiEngineModule.h"

#if __has_include(<ReactCommon/CxxTurboModuleUtils.h>)
#import <ReactCommon/CxxTurboModuleUtils.h>

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
}

@end

#else
#import <React/RCTBridgeModule.h>
#import <ReactCommon/RCTTurboModule.h>

@interface ShikiEngine : NSObject <RCTBridgeModule, RCTTurboModule>
@end

@implementation ShikiEngine

RCT_EXPORT_MODULE(ShikiEngine)

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeShikiEngineModule>(
      params.jsInvoker);
}

@end

#endif
