'use server';

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

function getEnv(key: string): string {
  if (process.env[key]) return process.env[key] as string;
  
  // Try admin's .env.local
  try {
    const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
    for (const line of envFile.split('\n')) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && match[1].trim() === key) {
        return match[2].trim().replace(/^"|"$/g, '');
      }
    }
  } catch(e) {}
  
  // Try QUMI-TECH's .env if running side-by-side
  try {
    const envFile = fs.readFileSync(path.resolve(process.cwd(), '../QUMI-TECH/.env'), 'utf-8');
    for (const line of envFile.split('\n')) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && match[1].trim() === key) {
        return match[2].trim().replace(/^"|"$/g, '');
      }
    }
  } catch(e) {}
  
  return "";
}

export async function sendReplyEmail(to: string, subject: string, message: string) {
  try {
    const user = getEnv("SMTP_USER");
    const pass = getEnv("SMTP_PASSWORD") || getEnv("SMTP_PASS");

    if (!user || !pass) {
      return {
        success: false,
        error: "SMTP credentials not configured. Please set SMTP_USER and SMTP_PASSWORD in .env.local or environment settings.",
      };
    }

    const port = Number(getEnv("SMTP_PORT") || 465);
    const transporter = nodemailer.createTransport({
      host: getEnv("SMTP_HOST") || "smtp.gmail.com",
      port: port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const companyName = getEnv("COMPANY_NAME") || 'QUMI Technologies';
    const smtpUser = getEnv("SMTP_USER");

    const html = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <p>${message.replace(/\n/g, '<br/>')}</p>
        <br/>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          Best regards,<br/>
          Customer Support Representative<br/>
          <strong>${companyName}</strong>
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${companyName}" <${smtpUser}>`,
      to,
      subject,
      html,
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}
