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
} from "../../../types";

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

interface AuthToken {
  token: string;
  email: string;
  is_admin: boolean;
  restricted_job: number;
}

class Backend {
  host: string;
  token: string;
  api: AxiosInstance;
  is_admin: boolean;
  email: string;
  restricted_job: number;

  constructor(host: string, token: string) {
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

  async getToken(user: string = undefined): Promise<AuthToken> {
    const path = `users/${user || "me"}/token`;
    const res = await this.api.get(path);
    return res.data;
  }
  async getJobToken(job_id: number): Promise<string> {
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
  async getCodebook(job_id: number) {
    const res = await this.api.get(`codingjob/${job_id}/codebook`);
    return res.data;
  }
  async getProgress(job_id: number) {
    const res = await this.api.get(`codingjob/${job_id}/progress`);
    return res.data;
  }
  async getUnit(job_id: number, i: number) {
    let path = `codingjob/${job_id}/unit`;
    const options = i != null ? { params: { index: i } } : {};
    const res = await this.api.get(path, options);
    return res.data;
  }
  async getCodingjob(job_id: number): Promise<Job> {
    const res = await this.api.get(`codingjob/${job_id}`);
    return res.data;
  }
  async getCodingjobDetails(job_id: number): Promise<Job> {
    const res = await this.api.get(`codingjob/${job_id}/details`);
    return res.data;
  }
  async getCodingjobAnnotations(job_id: number): Promise<JobAnnotation[]> {
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
  async getDebriefing(job_id: number): Promise<Debriefing> {
    const path = `codingjob/${job_id}/debriefing`;
    const res = await this.api.get(path);
    return res.data;
  }

  // POST
  postPassword(user?: string, password?: string) {
    const body = { password };
    return this.api.post(`users/${user || "me"}`, body);
  }
  postUsers(users: User[]) {
    return this.api.post("users", {
      users,
    });
  }
  async postAnnotation(
    job_id: number,
    unit_id: number,
    annotation: Annotation[],
    status: Status
  ): Promise<ConditionReport> {
    const data = { annotation, status };
    const res = await this.api.post(`codingjob/${job_id}/unit/${unit_id}/annotation`, data);
    return res.data;
  }
  async setJobSettings(job_id: number, settingsObj: JobSettings): Promise<void> {
    return await this.api.post(`codingjob/${job_id}/settings`, settingsObj);
  }
  async setJobUsers(job_id: number, users: User[], only_add: boolean) {
    const body = { users, only_add };
    return await this.api.post(`codingjob/${job_id}/users`, body);
  }
}

export default Backend;
