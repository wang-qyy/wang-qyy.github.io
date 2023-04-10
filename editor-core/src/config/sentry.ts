import * as Sentry from '@sentry/react';
import { history, matchPath } from 'umi';
import { Integrations } from '@sentry/tracing';
import { CaptureConsole } from '@sentry/integrations';
import SentryRRWeb from '@sentry/rrweb';
import { getRoutes } from '@@/core/routes'; // https://github.com/umijs/umi/issues/7104
import { useUserInfo } from '@/store/adapter/useUserInfo';
import { useEffect } from 'react';
// eslint-disable-next-line no-undef
window.__SENTRY_RELEASE__ = __SENTRY_RELEASE__;

export default function useSetupSentry() {
  const userInfo = useUserInfo();
  useEffect(() => {
    const integrations = [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV5Instrumentation(
          history,
          getRoutes(),
          matchPath,
        ),
        tracingOrigins: [],
      }),
      new CaptureConsole({ levels: ['error'] }),
    ];

    const enableSentryRRWeb = Math.random() > 0.8; // 20%的几率开启SentryRRWeb
    if (enableSentryRRWeb) {
      // recordCanvas 会监听canvas变化, 调用 ctx.getImageData来绘制图片，特别影响性能
      // integrations.push(new SentryRRWeb({ recordCanvas: true }) as any);
      integrations.push(new SentryRRWeb() as any);
    }

    const isDev = process.env.NODE_ENV === 'development';
    // eslint-disable-next-line no-undef
    const environment = __IS_TEST__ ? 'test' : process.env.NODE_ENV;
    console.log('env:', environment);

    Sentry.init({
      enabled: !isDev,
      // eslint-disable-next-line no-undef
      dsn: __SENTRY_DSN__,
      // eslint-disable-next-line no-undef
      release: __SENTRY_RELEASE__,
      // @ts-ignore
      integrations,
      sampleRate: isDev ? 1 : 0.5,
      tracesSampleRate: isDev ? 1 : 0.5,
      environment,
      initialScope: {
        tags: {
          'rrweb.active': enableSentryRRWeb ? 'yes' : 'no',
        },
      },
    });
  }, []);
  useEffect(() => {
    if (userInfo.id !== -1 && userInfo.id) {
      Sentry.setUser({
        id: `${userInfo.id}`,
        username: userInfo.username,
      });
      Sentry.setContext('userInfo', userInfo);
    }
  }, [userInfo.id]);
}
