import type { Group } from '@v2/types/group';

export type GetAllGroupsResponse = {
  groups: Group[];
};

export type CreateGroupRequest = {
  name: string;
};

export type CreateGroupResponse = {
  group_id: string;
  group: Group;
};
