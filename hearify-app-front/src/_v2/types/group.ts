export type Group = {
  _id: string;
  name: string;
  description: string;
  admins: string[];
  members: string[];
  invited_members: string[];
  assigned_quizzes: string[];
  owner_id: string;
  group_picture: string;
};

export type members = {
  _id: string;
  email: string;
  name: string;
  role: string;
  status: string;
};
