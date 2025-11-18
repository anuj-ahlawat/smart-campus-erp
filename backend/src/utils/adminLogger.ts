import { AdminLogModel } from "../models";

interface LogPayload {
  collegeId?: string;
  actorId?: string;
  [key: string]: unknown;
}

export const logAdminAction = async (action: string, payload: LogPayload) => {
  await AdminLogModel.create({
    action,
    payload,
    collegeId: payload.collegeId,
    actorId: payload.actorId
  });
};

