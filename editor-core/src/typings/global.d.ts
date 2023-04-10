export {};
declare global {
  interface Window {
    __SENTRY_RELEASE__: any;
    __EDITOR_STOP_RENDER__: boolean;
    xa?: any;
    __EDITOR_PERFORMANCE__: {
      completed: boolean;
      sended: boolean;
      recieve_end_time: number;
      dom_parse_end_time: number;
      all_resorce_loaded: number;
      user_template_get_ended: number;
      user_template_get_start: number;
      user_resorce_post_end: number;
      user_resorce_post_start: number;
    };
  }
}
