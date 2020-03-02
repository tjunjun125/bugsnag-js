#import "BugsnagReactNative.h"
#import "BugsnagReactNativeEmitter.h"
#import <Bugsnag.h>

@interface Bugsnag ()
+ (id)notifier;
+ (BOOL)bugsnagStarted;
+ (BugsnagConfiguration *)configuration;
@end

@implementation BugsnagReactNative

RCT_EXPORT_MODULE()

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(configure) {
  if (![Bugsnag bugsnagStarted]) {
    // TODO: fail loudly here
    return nil;
  }

  // TODO: use this emitter to notifier JS of changes to user, context and metadata
  BugsnagReactNativeEmitter *emitter = [BugsnagReactNativeEmitter new];

  // TODO: convert the entire config into a map
  BugsnagConfiguration *config = [Bugsnag configuration];
  return @{
    @"apiKey" : [config apiKey],
    @"releaseStage" : [config releaseStage] ?: @"production",
  };
}

/**
 * If update is nil, clear section. otherwise, replace section
 */
RCT_EXPORT_METHOD(updateMetadata
                  : (NSString *)section withData
                  : (NSDictionary *)update) {
  [Bugsnag clearMetadataInSection:section];
  if (update) {
    [[[Bugsnag configuration] metadata] addMetadataToSection:section
                                                      values:update];
  }
}

RCT_EXPORT_METHOD(updateContext
                  :(NSString *)context) {
  [Bugsnag setContext:context];
}

RCT_EXPORT_METHOD(updateUser
                  :(NSString *)id
         withEmail:(NSString *)email
          withName:(NSString *)name) {
  [Bugsnag setUser:id withName:name andEmail:email];
}

RCT_EXPORT_METHOD(dispatch
                  :(NSDictionary *)payload
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject) {
  // Should attempt delivery via [config session], then write to disk
  // if it fails. Either way, the promise should be resolved (unless writing
  // to disk fails?
  resolve(@{});
}

/** options contains:
 *  * message (string)
 *  * type (string)
 *  * metadata (dict<string, primitive>)
 */
RCT_EXPORT_METHOD(leaveBreadcrumb : (NSDictionary *)options) {
  [Bugsnag leaveBreadcrumbWithBlock:^(BugsnagBreadcrumb *crumb) {
    crumb.message = options[@"message"];
    crumb.type = BSGBreadcrumbTypeFromString(options[@"type"]);
    crumb.metadata = options[@"metadata"];
  }];
}

RCT_EXPORT_METHOD(startSession) { [Bugsnag startSession]; }
RCT_EXPORT_METHOD(stopSession) { [Bugsnag stopSession]; }
RCT_EXPORT_METHOD(resumeSession) { [Bugsnag resumeSession]; }

RCT_EXPORT_METHOD(getPayloadInfo
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  NSMutableDictionary *info = [NSMutableDictionary new];
  NSArray *crumbs = [[[Bugsnag configuration] breadcrumbs] arrayValue];
  [info addObject:crumbs forKey:@"breadcrumbs"];
  // TODO: app
  // TODO: device
  // TODO: threads
  //
  // This should use the same information flow as normal reporting, so probably
  // will do something like:
  //
  // * generate crash context (ctx)
  // * generate temp file (tmp)
  // * kswhatever_writeStandardReport(ctx, tmp)
  // * init BugsnagEvent with contents of tmp
  // * populate info from BugsnagEvent
  resolve(info);
}

@end
