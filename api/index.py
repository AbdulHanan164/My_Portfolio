from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
import aiosmtplib
from email.message import EmailMessage
from datetime import datetime
import os
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Portfolio Contact API", version="1.0.0")

# Setup Rate Limiter (using client IP)
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup CORS Middleware
# Allowing all origins for ease of testing, but you should restrict this to your domain in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change to ["https://yourdomain.com", "http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Model for incoming contact requests
class ContactForm(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Sender's name")
    email: EmailStr = Field(..., description="Sender's valid email address")
    subject: str = Field(..., min_length=2, max_length=200, description="Subject of the email")
    message: str = Field(..., min_length=10, max_length=5000, description="Email body content")
    # Honeypot field for spam bots. If a bot fills this out, the request is silently ignored.
    website_honeypot: str = Field(default="", description="Leave empty. Used for bot protection.")

async def send_email_async(contact_data: ContactForm, client_ip: str):
    """
    Asynchronously sends an email using Gmail SMTP and aiosmtplib.
    """
    gmail_user = os.getenv("GMAIL_USER")
    gmail_app_password = os.getenv("GMAIL_APP_PASSWORD", "").replace(" ", "")

    if not gmail_user or not gmail_app_password:
        raise Exception("Server configuration error: Gmail credentials not set.")

    # Construct the email message
    msg = EmailMessage()
    msg['Subject'] = f"🚀 New Portfolio Lead: {contact_data.subject}"
    msg['From'] = f"Portfolio Alert <{gmail_user}>"
    msg['To'] = gmail_user  # Send to yourself
    msg['Reply-To'] = contact_data.email

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Fallback Plain Text body
    text_body = f"""
    New Contact Form Submission from Portfolio
    
    Name: {contact_data.name}
    Email: {contact_data.email}
    Subject: {contact_data.subject}
    Message: {contact_data.message}
    """
    msg.set_content(text_body)

    # Eye-catching HTML body
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin: 0 auto; border-top: 5px solid #00E5FF; }}
            h2 {{ color: #1a1a1a; margin-top: 0; font-size: 24px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; }}
            .info-block {{ background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px; }}
            .info-item {{ margin-bottom: 12px; font-size: 15px; }}
            .info-label {{ font-weight: 600; color: #64748b; display: inline-block; width: 80px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }}
            .info-value {{ color: #0f172a; font-weight: 500; }}
            .message-block {{ background-color: #ffffff; border-left: 4px solid #6366f1; padding: 15px 20px; margin-top: 10px; border-radius: 0 8px 8px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }}
            .message-label {{ font-weight: 600; color: #64748b; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }}
            .message-content {{ color: #334155; line-height: 1.6; font-size: 16px; white-space: pre-wrap; margin: 0; }}
            .footer {{ margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f0f0f0; padding-top: 15px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>✨ New Portfolio Message</h2>
            
            <div class="info-block">
                <div class="info-item"><span class="info-label">Name:</span> <span class="info-value">{contact_data.name}</span></div>
                <div class="info-item"><span class="info-label">Email:</span> <span class="info-value"><a href="mailto:{contact_data.email}" style="color: #00E5FF; text-decoration: none;">{contact_data.email}</a></span></div>
                <div class="info-item"><span class="info-label">Subject:</span> <span class="info-value">{contact_data.subject}</span></div>
            </div>

            <div class="message-label">MESSAGE CONTENT:</div>
            <div class="message-block">
                <p class="message-content">{contact_data.message}</p>
            </div>

            <div class="footer">
                Received on {timestamp} &bull; Client IP: {client_ip}
            </div>
        </div>
    </body>
    </html>
    """
    
    msg.add_alternative(html_body, subtype='html')

    # Connect to Gmail SMTP securely and send
    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=465,
        use_tls=True,
        username=gmail_user,
        password=gmail_app_password
    )

@app.post("/api/contact")
@limiter.limit("5/minute") # Rate limiting to prevent spam floods
async def contact(request: Request, form: ContactForm):
    """
    Endpoint to receive contact form submissions and send an email.
    """
    # 1. Honeypot check
    if form.website_honeypot != "":
        # If the honeypot is filled, act like it succeeded to fool the bot
        return {"status": "success", "message": "Message received."}

    client_ip = get_remote_address(request) or "Unknown IP"

    try:
        # 2. Send email asynchronously
        await send_email_async(form, client_ip)
        return {"status": "success", "message": "Email sent successfully!"}
    
    except Exception as e:
        # Log the error internally (not implemented here for brevity, but a print works for basic logging)
        print(f"Error sending email: {e}")
        # Return a clean 500 error to the client
        raise HTTPException(status_code=500, detail=f"Failed to send email due to an internal server error: {str(e)}")

@app.get("/api")
def read_root():
    return {"message": "Portfolio Contact API is running."}
