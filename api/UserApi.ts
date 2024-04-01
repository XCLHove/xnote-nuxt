import request from "~/utils/request.ts";
import { UserDTO } from "~/interfaces/entity/dto/UserDTO";
import { Result } from "~/interfaces/Result.ts";
import { User } from "~/interfaces/entity/User.ts";

/**
 * 用户登录函数
 * @param {Object} userLoginInfo - 用户登录所需信息
 * @param {string} userLoginInfo.account - 用户账号
 * @param {string} userLoginInfo.password - 用户密码
 */
export function userLogin({
  account,
  password,
}: {
  account: string;
  password: string;
}) {
  return new Promise<Result<string>>((resolve, reject) => {
    request
      .get("/users/login", {
        params: {
          account: account,
          password: password,
        },
      })
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 用户退出登录
 */
export function userLogout() {
  return new Promise<Result<any>>((resolve, reject) => {
    request
      .post("/users/logout")
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 用户注册
 * @param {UserDTO} registerInfo - 用户注册所需信息
 */
export function userRegister(registerInfo: UserDTO) {
  return new Promise<Result<any>>((resolve, reject) => {
    request
      .put("/users/register", registerInfo)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 获取用户自己的信息
 */
export function getUserSelfInfo() {
  return new Promise<Result<User>>((resolve, reject) => {
    request.get("/users/self").then(({ data }) => {
      resolve(data);
    });
  });
}

/**
 * 发送验证码
 * @param {Object} object - 参数对象
 * @param {string} object.email - 邮箱地址
 */
export function sendVerificationCode({ email }: { email: string }) {
  return new Promise<Result<any>>((resolve, reject) => {
    request
      .get("/users/verificationCode", {
        params: {
          email: email,
        },
      })
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
