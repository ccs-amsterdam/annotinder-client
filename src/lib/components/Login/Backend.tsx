import Axios, { AxiosInstance } from "axios";
import {
  Annotation,
  Debriefing,
  Job,
  JobAnnotation,
  JobSettings,
  Status,
  User,
  ConditionReport,
} from "../../types";

export async function getHostInfo(host: string, email: string) {
  const res = await Axios.get(`${host}/host`, { params: { email } });
  res.data.host = host;
  return res.data;
}

export async function passwordLogin(host: string, email: string, password: string) {
  const d = new FormData();
  d.append("username", email);
  d.append("password", password);
  const response = await Axios.post(`${host}/users/me/token`, d);
  return response.data.token;
}

export async function redeemJobToken(host: string, token: string, user_id: string) {
  const params = { token, user_id };
  const res = await Axios.get(`${host}/guest/jobtoken`, { params });
  return res.data;
}

export async function requestMagicLink(host: string, email: string) {
  const res = await Axios.get(`${host}/users/${email}/magiclink`);
  return res.data;
}

export async function redeemMagicLink(
  host: string,
  email: string,
  secret: string,
  password?: string
) {
  const params: { secret: string; password?: string } = { secret };
  if (password) params.password = password;
  const res = await Axios.get(`${host}/users/${email}/secret`, { params });
  return res.data.token;
}

interface LoginDetails {
  token: string;
  user_id: number;
  name: string;
  email: string;
  is_admin: boolean;
  restricted_job: string;
  restricted_job_label: string;
}

class Backend {
  host: string;
  token: string;
  api: AxiosInstance;
  is_admin: boolean;
  user_id: number;
  name: string;
  email: string;
  restricted_job: string;
  restricted_job_label: string;

  constructor(host: string, token: string) {
    this.host = host;
    this.token = token;
    this.api = Axios.create({
      baseURL: host,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async init() {
    const d = await this.login();
    this.user_id = d.user_id;
    this.name = d.name;
    this.email = d.email;
    this.is_admin = d.is_admin;
    this.token = d.token;
    this.restricted_job = d.restricted_job;
    this.restricted_job_label = d.restricted_job_label;
  }

  // GET

  async login(user: string = undefined): Promise<LoginDetails> {
    const path = `users/me/login`;
    const res = await this.api.get(path);
    return res.data;
  }

  async getToken(user: string = undefined): Promise<string> {
    const path = `users/${user || "me"}/token`;
    const res = await this.api.get(path);
    return res.data.token;
  }
  async getJobToken(job_id: string): Promise<string> {
    const res = await this.api.get(`codingjob/${job_id}/token`);
    return res.data.token;
  }
  async getUsers(): Promise<User[]> {
    const res = await this.api.get("users");
    return res.data.users;
  }
  async getUsers2(page: number, pagesize: number): Promise<any> {
    // changing to API handling pagination
    const options = {
      params: {
        offset: page * pagesize,
        n: pagesize,
      },
    };
    const res = await this.api.get("users", options);
    return res.data;
  }
  async getCodebook(job_id: string) {
    const res = await this.api.get(`codingjob/${job_id}/codebook`);
    return res.data;
  }
  async getProgress(job_id: string) {
    const res = await this.api.get(`codingjob/${job_id}/progress`);
    return res.data;
  }
  async getUnit(job_id: string, i: number) {
    let path = `codingjob/${job_id}/unit`;
    const options = i != null ? { params: { index: i } } : {};
    const res = await this.api.get(path, options);
    return res.data;
  }
  async getCodingjob(job_id: string): Promise<Job> {
    const res = await this.api.get(`codingjob/${job_id}`);
    return res.data;
  }
  async getCodingjobDetails(job_id: string): Promise<Job> {
    const res = await this.api.get(`codingjob/${job_id}/details`);
    return res.data;
  }
  async getCodingjobAnnotations(job_id: string): Promise<JobAnnotation[]> {
    const res = await this.api.get(`codingjob/${job_id}/annotations`);
    return res.data;
  }
  async getAllJobs(): Promise<Job[]> {
    const res = await this.api.get("codingjob");
    return res.data.jobs;
  }
  async getUserJobs(user?: string): Promise<Job[]> {
    const path = `users/${user || "me"}/codingjob`;
    const res = await this.api.get(path);
    return res.data.jobs;
  }
  async getDebriefing(job_id: string): Promise<Debriefing> {
    const path = `codingjob/${job_id}/debriefing`;
    const res = await this.api.get(path);
    return res.data;
  }

  // POST
  postPassword(email?: string, password?: string) {
    const body = { email, password };
    return this.api.post(`users/me/password`, body);
  }
  postUsers(users: User[]) {
    return this.api.post("users", {
      users,
    });
  }
  async postAnnotation(
    job_id: string,
    unit_id: string,
    annotation: Annotation[],
    status: Status
  ): Promise<ConditionReport> {
    const data = { annotation, status };
    const res = await this.api.post(`codingjob/${job_id}/unit/${unit_id}/annotation`, data);
    return res.data;
  }
  async setJobSettings(job_id: string, settingsObj: JobSettings): Promise<void> {
    return await this.api.post(`codingjob/${job_id}/settings`, settingsObj);
  }
  async setJobUsers(job_id: string, users: User[], only_add: boolean) {
    const body = { users, only_add };
    return await this.api.post(`codingjob/${job_id}/users`, body);
  }
  async setPassword(email: string, password: string) {
    const body = { email, password };
    return await this.api.post(`users/me/password`, body);
  }
}

export default Backend;
