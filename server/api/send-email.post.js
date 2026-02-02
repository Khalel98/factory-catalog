import nodemailer from 'nodemailer';
import { readFile } from 'fs/promises';
import { join } from 'path';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // Получаем настройки из google-sheets-credentials.json
    const credentialsPath = join(process.cwd(), 'google-sheets-credentials.json');
    const credentialsData = await readFile(credentialsPath, 'utf-8');
    const config = JSON.parse(credentialsData);
    
    const gmailUser = config.gmail_user || '';
    const gmailAppPassword = config.gmail_app_password || '';
    const recipientEmail = config.recipient_email || 'khalel.demeuov@gmail.com';
    
    // Проверяем наличие необходимых переменных
    if (!gmailUser || !gmailAppPassword) {
      throw new Error('Gmail credentials not configured. Please set gmail_user and gmail_app_password in google-sheets-credentials.json file');
    }
    
    // Создаем транспорт для отправки email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });
    
    // Формируем тему письма
    const subject = body.productName 
      ? `Новая заявка: ${body.productName}` 
      : 'Новая заявка с сайта';
    
    // Формируем HTML содержимое письма
    const htmlContent = formatEmailHTML(body);
    
    // Формируем текстовое содержимое письма
    const textContent = formatMessage(body);
    
    // Подготавливаем вложения
    const attachments = [];
    if (body.requisites && body.requisites.fileData && body.requisites.fileName) {
      try {
        // Декодируем base64 в Buffer
        const fileBuffer = Buffer.from(body.requisites.fileData, 'base64');
        attachments.push({
          filename: body.requisites.fileName,
          content: fileBuffer,
          contentType: body.requisites.fileType || 'application/octet-stream'
        });
      } catch (error) {
        console.error('Ошибка обработки файла:', error);
        // Продолжаем отправку без файла, но добавляем информацию в текст
      }
    }
    
    // Отправляем email
    const mailOptions = {
      from: `"Газсервис-7" <${gmailUser}>`,
      to: recipientEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      message: 'Заявка успешно отправлена',
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    return {
      success: false,
      message: error.message || 'Произошла ошибка при отправке заявки'
    };
  }
});

function formatMessage(body) {
  let message = '';
  
  message += `Тип заявителя: ${body.isLegalEntity ? 'Юридическое лицо' : 'Физическое лицо'}\n\n`;
  
  if (body.isLegalEntity) {
    message += `Название компании: ${body.companyName || 'Не указано'}\n`;
    message += `Контактное лицо: ${body.contactPerson || 'Не указано'}\n`;
  } else {
    message += `ФИО: ${body.fullName || 'Не указано'}\n`;
  }
  
  message += `Телефон: ${body.phone || 'Не указан'}\n`;
  message += `Email: ${body.email || 'Не указан'}\n`;
  
  if (body.productName) {
    message += `\nТовар/Услуга: ${body.productName}\n`;
  }
  
  if (body.message) {
    message += `\nСообщение:\n${body.message}\n`;
  }
  
  if (body.requisites && body.requisites.fileName) {
    message += `\nПрикреплен файл с реквизитами: ${body.requisites.fileName}\n`;
  }
  
  return message;
}

function formatEmailHTML(body) {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e88e5, #1565c0); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #52606d; margin-bottom: 5px; display: block; }
        .value { color: #1f2933; }
        .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
        .message-box { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #1e88e5; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Новая заявка с сайта</h2>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Тип заявителя:</span>
            <span class="value">${body.isLegalEntity ? 'Юридическое лицо' : 'Физическое лицо'}</span>
          </div>
          
          ${body.isLegalEntity ? `
            <div class="field">
              <span class="label">Название компании:</span>
              <span class="value">${body.companyName || 'Не указано'}</span>
            </div>
            <div class="field">
              <span class="label">Контактное лицо:</span>
              <span class="value">${body.contactPerson || 'Не указано'}</span>
            </div>
          ` : `
            <div class="field">
              <span class="label">ФИО:</span>
              <span class="value">${body.fullName || 'Не указано'}</span>
            </div>
          `}
          
          <div class="divider"></div>
          
          <div class="field">
            <span class="label">Телефон:</span>
            <span class="value"><a href="tel:${body.phone || ''}" style="color: #1e88e5; text-decoration: none;">${body.phone || 'Не указан'}</a></span>
          </div>
          
          <div class="field">
            <span class="label">Email:</span>
            <span class="value"><a href="mailto:${body.email || ''}" style="color: #1e88e5; text-decoration: none;">${body.email || 'Не указан'}</a></span>
          </div>
          
          ${body.productName ? `
            <div class="divider"></div>
            <div class="field">
              <span class="label">Товар/Услуга:</span>
              <span class="value">${body.productName}</span>
            </div>
          ` : ''}
          
          ${body.message ? `
            <div class="divider"></div>
            <div class="message-box">
              <span class="label">Сообщение:</span>
              <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${body.message}</div>
            </div>
          ` : ''}
          
          ${body.requisites && body.requisites.fileName ? `
            <div class="divider"></div>
            <div class="field">
              <span class="label">Прикреплен файл с реквизитами:</span>
              <span class="value">${body.requisites.fileName}</span>
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
  
  return html;
}
