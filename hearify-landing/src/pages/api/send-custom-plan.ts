import nodemailer from 'nodemailer';

import type { Transporter } from 'nodemailer';
import type { NextApiRequest, NextApiResponse } from 'next';

type RequestBody = {
  name: string;
  email: string;
  description: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, description } = req.body as RequestBody;

  if (!name || !email || !description) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const transporter: Transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Custom Plan Form" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      replyTo: email,
      subject: '📩 New Custom Plan Submission',
      text: `
You have a new custom plan request:

Name: ${name}
Email: ${email}

Requirements:
${description}
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Email error:', error.message ?? error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
