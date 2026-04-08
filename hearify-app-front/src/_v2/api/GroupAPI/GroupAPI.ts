import { Group } from '@v2/types/group';
import { Quiz } from '@v2/types/quiz';
import client from '../client';

import type * as I from './GroupAPI.types';

class GroupAPI {
  public static getAllGroups = async (): Promise<I.GetAllGroupsResponse> => {
    const response = await client.get<I.GetAllGroupsResponse>('/api/group-management/groups');

    return response.data;
  };

  public static getGroup = async (groupId: string): Promise<Group> => {
    const response = await client.get(`/api/group-management/groups/${groupId}`);

    return response.data;
  };

  public static getGroupQuizzes = async (groupId: string): Promise<Quiz[]> => {
    const response = await client.get(`/api/group-management/groups/${groupId}/quizzes`);

    return response.data;
  };

  public static createGroup = async (name: string): Promise<I.CreateGroupResponse> => {
    const requestBody: I.CreateGroupRequest = {
      name,
    };

    const response = await client.post<I.CreateGroupResponse>('/api/group-management/groups', requestBody);
    return response.data;
  };

  public static deleteGroup = async (groupId: string): Promise<void> => {
    await client.delete(`/api/group-management/groups/${groupId}`);
  };

  public static addQuizzes = async (groupId: string, quizIds: string[]): Promise<void> => {
    await client.put(`/api/group-management/groups/${groupId}/quizzes`, {
      quiz_id: quizIds,
    });
  };

  public static inviteMember = async (groupId: string, userEmail: string, role: string): Promise<void> => {
    await client.post(`/api/group-management/groups/${groupId}/invite`, null, {
      params: {
        user_email: userEmail,
        role: role,
      },
    });
  };

  public static removeMember = async (groupId: string, userId: string): Promise<void> => {
    await client.delete(`/api/group-management/groups/${groupId}/users/${userId}`);
  };

  public static acceptMember = async (groupId: string, userId: string): Promise<void> => {
    await client.post(`/api/group-management/groups/${groupId}/invite/${userId}/accept`);
  };

  public static getGroupMembers = async (groupId: string) => {
    const response = await client.get(`/api/group-management/groups/${groupId}/users`);

    return response.data;
  };

  public static changeGroupName = async (groupId: string, groupName: string): Promise<void> => {
    await client.patch(`/api/group-management/groups/${groupId}`, {
      name: groupName,
    });
  };

  public static deleteGroupQuiz = async (groupId: string, quizId: string[]): Promise<void> => {
    await client.delete(`/api/group-management/groups/${groupId}/quizzes`, {
      data: {
        quiz_id: quizId,
      },
    });
  };
}

export default GroupAPI;
