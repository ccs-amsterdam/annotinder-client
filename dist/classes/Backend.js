"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getToken = getToken;

require("core-js/modules/es.promise.js");

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function getToken(host, email, password) {
  const response = await _axios.default.get("".concat(host, "/token"), {
    auth: {
      username: email,
      password: password
    }
  });
  return response.data.token;
}

class Backend {
  constructor(host, email, token) {
    this.host = host;
    this.email = email;
    this.token = token;
    this.api = _axios.default.create({
      baseURL: host,
      headers: {
        Authorization: "Bearer ".concat(token)
      }
    });
  }

  async init() {
    try {
      await getToken();
      console.log(this.email);
    } catch (e) {
      console.log(e);
    }
  } // GET


  async getJobs() {
    const res = await this.api.get("/codingjobs");
    return res.data;
  }

  async getToken() {
    const res = await this.api.get("/token");
    return res.data;
  }

  async getCodebook(job_id) {
    const res = await this.api.get("/codingjob/".concat(job_id, "/codebook"));
    return res.data;
  }

  async getProgress(job_id) {
    console.log("test");
    const res = await this.api.get("/codingjob/".concat(job_id, "/progress"));
    console.log(res);
    return res.data;
  }

  async getUnit(job_id, i) {
    let path = "/codingjob/".concat(job_id, "/unit");
    if (i !== null) path += "?index=".concat(i);
    const res = await this.api.get(path);
    return res.data;
  }

  async getCodingjob(job_id) {
    const res = await this.api.get("/codingjob/".concat(job_id));
    return res.data;
  } // POST


  postCodingjob(codingjobPackage, title) {
    codingjobPackage.title = title;
    return this.api.post("/codingjob", {
      title: title,
      units: codingjobPackage.units,
      codebook: codingjobPackage.codebook,
      provenance: codingjobPackage.provenance,
      rules: codingjobPackage.rules
    });
  }

  postAnnotation(job_id, unit_id, annotation, status) {
    const data = {
      annotation,
      status
    };
    this.api.post("/codingjob/".concat(job_id, "/unit/").concat(unit_id, "/annotation"), data);
  }

}

var _default = Backend;
exports.default = _default;