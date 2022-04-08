import Axios from "axios";

export async function passwordLogin(host, email, password) {
  const res = await Axios.get(`${host}/users/me/token`, {
    auth: { username: email, password: password },
  });
  return res.data.token;
}

export async function redeemJobToken(token, user_id) {
  const res = await this.api.get("/jobtoken", { params: { token, user_id } });
  return res.data.token;
}

class Backend {
  constructor(host, token) {
    this.host = host;
    this.token = token;
    this.api = Axios.create({
      baseURL: host,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async init() {
    const d = await this.getToken();
    this.email = d.email;
    this.is_admin = d.is_admin;
    this.token = d.token; //getToken should give a refreshed token, which is set to localstorage in useBackend
  }

  // GET

  async getToken(user) {
    const path = `/users/${user || "me"}/token`;
    const res = await this.api.get(path);
    return res.data;
  }
  async getUsers() {
    const res = await this.api.get("/users");
    return res.data.users;
  }
  async getCodebook(job_id) {
    const res = await this.api.get(`/codingjob/${job_id}/codebook`);
    return res.data;
  }
  async getProgress(job_id) {
    const res = await this.api.get(`/codingjob/${job_id}/progress`);
    return res.data;
  }
  async getUnit(job_id, i) {
    let path = `/codingjob/${job_id}/unit`;
    if (i !== null) path += `?index=${i}`;
    const res = await this.api.get(path);
    return res.data;
  }
  async getCodingjob(job_id) {
    const res = await this.api.get(`/codingjob/${job_id}`);
    return res.data;
  }
  async getCodingjobDetails(job_id) {
    const res = await this.api.get(`/codingjob/${job_id}/details`);
    return res.data;
  }
  async getCodingjobAnnotations(job_id) {
    const res = await this.api.get(`/codingjob/${job_id}/annotations`);
    return res.data;
  }
  async getAllJobs() {
    const res = await this.api.get("/codingjobs");
    return res.data;
  }
  async getUserJobs(user) {
    const path = `/users/${user || "me"}/codingjobs`;
    const res = await this.api.get(path);
    return res.data;
  }
  async toggleJobArchived(job_id) {
    const res = await this.api.get(`/codingjob/${job_id}/archived`);
    return res.data;
  }

  // POST
  postCodingjob(codingjobPackage, title) {
    codingjobPackage.title = title;

    return this.api.post(`/codingjob`, {
      title: title,
      units: codingjobPackage.units,
      codebook: codingjobPackage.codebook,
      provenance: codingjobPackage.provenance,
      rules: codingjobPackage.rules,
    });
  }
  postPassword(user, password) {
    const body = { password };
    if (user) body.user = user;
    return this.api.post(`/password`, body);
  }
  postUsers(users) {
    return this.api.post("/users", users);
  }
  postAnnotation(job_id, unit_id, annotation, status) {
    const data = { annotation, status };
    return this.api.post(`/codingjob/${job_id}/unit/${unit_id}/annotation`, data);
  }
}

export default Backend;
