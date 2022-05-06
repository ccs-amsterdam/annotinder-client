import Axios from "axios";

export async function passwordLogin(host, email, password) {
  const d = new FormData();
  d.append("username", email);
  d.append("password", password);
  const response = await Axios.post(`${host}/annotator/users/me/token`, d);
  return response.data.token;
}

export async function redeemJobToken(host, token, user_id) {
  const params = { token };
  if (user_id) params.user_id = user_id;
  const res = await Axios.get(`${host}/annotator/guest/jobtoken`, { params });
  return res.data;
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
    this.restricted_job = d.restricted_job;
  }

  // GET

  async getToken(user) {
    const path = `annotator/users/${user || "me"}/token`;
    const res = await this.api.get(path);
    return res.data;
  }
  async getJobToken(job_id) {
    const res = await this.api.get(`annotator/codingjob/${job_id}/token`);
    return res.data;
  }
  async getUsers() {
    const res = await this.api.get("annotator/users");
    return res.data.users;
  }
  async getCodebook(job_id) {
    const res = await this.api.get(`annotator/codingjob/${job_id}/codebook`);
    return res.data;
  }
  async getProgress(job_id) {
    const res = await this.api.get(`annotator/codingjob/${job_id}/progress`);
    return res.data;
  }
  async getUnit(job_id, i) {
    let path = `annotator/codingjob/${job_id}/unit`;
    if (i !== null) path += `?index=${i}`;
    const res = await this.api.get(path);
    return res.data;
  }
  async getCodingjob(job_id) {
    const res = await this.api.get(`annotator/codingjob/${job_id}`);
    return res.data;
  }
  async getCodingjobDetails(job_id) {
    const res = await this.api.get(`annotator/codingjob/${job_id}/details`);
    return res.data;
  }
  async getCodingjobAnnotations(job_id) {
    const res = await this.api.get(`annotator/codingjob/${job_id}/annotations`);
    return res.data;
  }
  async getAllJobs() {
    const res = await this.api.get("annotator/codingjob");
    return res.data;
  }
  async getUserJobs(user) {
    const path = `annotator/users/${user || "me"}/codingjob`;
    const res = await this.api.get(path);
    return res.data;
  }

  // POST
  postCodingjob(codingjobPackage, title) {
    codingjobPackage.title = title;

    return this.api.post(`annotator/codingjob`, {
      title: title,
      units: codingjobPackage.units,
      codebook: codingjobPackage.codebook,
      provenance: codingjobPackage.provenance,
      rules: codingjobPackage.rules,
    });
  }
  postPassword(user, password) {
    const body = { password };
    return this.api.post(`annotator/users/${user || "me"}`, body);
  }
  postUsers(users) {
    return this.api.post("annotator/users", {
      users: users.users,
    });
  }
  postAnnotation(job_id, unit_id, annotation, status) {
    const data = { annotation, status };
    return this.api.post(`annotator/codingjob/${job_id}/unit/${unit_id}/annotation`, data);
  }
  async setJobSettings(job_id, settingsObj) {
    return await this.api.post(`annotator/codingjob/${job_id}/settings`, settingsObj);
  }
  async setJobUsers(job_id, users, only_add) {
    const body = { users };
    if (only_add) body.only_add = true;
    return await this.api.post(`annotator/codingjob/${job_id}/users`, body);
  }
}

export default Backend;
