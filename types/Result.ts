export interface Result<T> {
  status: ResultStatus
  message: string
  data: T
}

export enum ResultStatus {
  /**
   * 操作成功！
   */
  SUCCESS = 200,
  EXCEPTION = 400,
  /**
   * 请求路径不存在！
   */
  NOT_FOUND = 404,
  /**
   * 操作失败！
   */
  FAIL = 500,
  /**
   * 系统异常！
   */
  SYSTEM_EXCEPTION = 550,
  /**
   * IP访问频率异常！
   */
  IP_FREQUENCY_EXCEPTION = 551,
  /**
   * 设备访问频率异常！
   */
  DEVICE_FREQUENCY_EXCEPTION = 552,
  /**
   * 参数格式错误！
   */
  PARAMETER_VALIDATE_EXCEPTION = 553,
  /**
   * 用户业务异常！
   */
  USER_SERVICE_EXCEPTION = 600,
  /**
   * 用户身份校验失败！
   */
  USER_TOKEN_EXCEPTION = 601,
  /**
   * 图片业务异常！
   */
  IMAGE_SERVICE_EXCEPTION = 700,
  /**
   * 笔记业务异常！
   */
  NOTE_SERVICE_EXCEPTION = 800,
  /**
   * 验证码业务异常！
   */
  VERIFICATION_CODE_EXCEPTION = 900,
  /**
   * 笔记类型业务异常！
   */
  NOTE_TYPE_SERVICE_EXCEPTION = 1000,
  /**
   * 笔记分享记录业务异常！
   */
  SHARE_NOTE_SERVICE_EXCEPTION = 1100,
  /**
   * 用户图片业务异常！
   */
  USER_IMAGE_SERVICE_EXCEPTION = 1200,
}
