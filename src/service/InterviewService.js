import {get, post} from './apiService';

const BASE_URL = "/interviews"

export async function getAllInterviews() {
  return await get({
    url: `${BASE_URL}/get_all`,
  });
}

export async function getInterviewByUuid(id) {
  return await get({
    url: `${BASE_URL}/get/${id}`,
  });
}
/*
export async function getInterviewByUuid(uuid) {
  return await get({
    url: `${BASE_URL}/get_by_uuid/${uuid}`,
  });
}
*/
export async function addInterview() {
  return await post({
    url: `${BASE_URL}/add`
  });
}

export async function getInterviewPlannerMessages(interviewId) {
  return await get({
    url: `${BASE_URL}/planning/${interviewId}/all`,
  });
}

export async function sendInterviewPlannerMessage({ interviewId, message }) {
  return await post({
    url: `${BASE_URL}/planning/${interviewId}`,
    data: { message },
  });
}

export async function addUserInterview({ interviewUuid, additionalInformation }) {
  return await post({
    url: `${BASE_URL}/user/add`,
    data: { interviewUuid, additionalInformation },
  });
}

export async function getUserInterviews({ interviewUuid }) {
  return await get({
    url: `${BASE_URL}/user/get_all_by_interview_uuid/${interviewUuid}`,
  });
}

export async function getUserInterviewByUuid({ userInterviewUuid }) {
  return await get({
    url: `${BASE_URL}/user/get_by_uuid/${userInterviewUuid}`,
  });
}

export async function getUserInterviewMessages({ userInterviewUuid }) {
  return await get({
    url: `${BASE_URL}/user/${userInterviewUuid}/all`,
  });
}

export async function sendUserInterviewMessage({ userInterviewUuid, message }) {
  return await post({
    url: `${BASE_URL}/user/${userInterviewUuid}`,
    data: { message },
  });
}
