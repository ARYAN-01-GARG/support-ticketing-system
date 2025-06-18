import axios from 'axios';
import 'dotenv/config';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;

const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

export async function createGithubIssue(title: string, body: string) {
  const [owner, repo] = (GITHUB_REPO || '').split('/');
  const res = await githubApi.post(`/repos/${owner}/${repo}/issues`, { title, body });
  return res.data;
}

export async function closeGithubIssue(issue_number: number) {
  const [owner, repo] = (GITHUB_REPO || '').split('/');
  const res = await githubApi.patch(`/repos/${owner}/${repo}/issues/${issue_number}`, { state: 'closed' });
  return res.data;
}

export async function getGithubIssue(issue_number: number) {
  const [owner, repo] = (GITHUB_REPO || '').split('/');
  const res = await githubApi.get(`/repos/${owner}/${repo}/issues/${issue_number}`);
  return res.data;
}
