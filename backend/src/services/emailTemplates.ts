export const verifyEmailTemplate = (link: string, adminName: string) => `
  <h1>Verify your email</h1>
  <p>Hello ${adminName},</p>
  <p>Please verify your email to activate your Smart Campus ERP account.</p>
  <a href="${link}" style="display:inline-block;padding:12px 16px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;">Verify Email</a>
`;

export const inviteTemplate = (params: {
  inviteLink: string;
  role: string;
  collegeName: string;
}) => `
  <h1>You're invited to ${params.collegeName}</h1>
  <p>You have been invited to join as <strong>${params.role}</strong>.</p>
  <a href="${params.inviteLink}" style="display:inline-block;padding:12px 16px;background:#16a34a;color:#fff;border-radius:8px;text-decoration:none;">Accept Invite</a>
`;

export const passwordResetTemplate = (link: string) => `
  <h1>Reset your password</h1>
  <p>Click the button below to reset your password. This link will expire shortly.</p>
  <a href="${link}" style="display:inline-block;padding:12px 16px;background:#ea580c;color:#fff;border-radius:8px;text-decoration:none;">Reset Password</a>
`;

export const outpassStatusTemplate = (studentName: string, status: string) => `
  <p>Outpass request for ${studentName} has been <strong>${status}</strong>.</p>
`;

export const resultPublishedTemplate = (subject: string, link: string) => `
  <p>New result uploaded for ${subject}.</p>
  <a href="${link}">View Result</a>
`;


