export const welcomeEmailTemplate = (name: string, referralCode: string, referralLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .code-box { background: #fff; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
    .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px; }
    .link-box { background: #fff; padding: 15px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to FileSure Templates!</h1>
    </div>
    <div class="content">
      <h2>Hi ${name}! 👋</h2>
      <p>Welcome to our Digital Templates Marketplace! We're excited to have you on board.</p>

      <div class="code-box">
        <p style="margin: 0; color: #666; font-size: 14px;">Your Unique Referral Code</p>
        <div class="code">${referralCode}</div>
      </div>

      <h3>🎁 Start Earning Credits!</h3>
      <p>Share your referral link with friends and earn <strong>2 credits</strong> when they make their first purchase. They also get <strong>2 credits</strong>!</p>

      <div class="link-box">
        <strong>Your Referral Link:</strong><br>
        <a href="${referralLink}" style="color: #667eea; word-break: break-all;">${referralLink}</a>
      </div>

      <p style="text-align: center;">
        <a href="${referralLink}" class="btn">Share Your Link</a>
      </p>

      <h3>What's Next?</h3>
      <ul>
        <li>Browse our premium template collection</li>
        <li>Make your first purchase and earn 2 credits</li>
        <li>Share your referral link to earn more credits</li>
        <li>Track your referrals on your dashboard</li>
      </ul>

      <div class="footer">
        <p>This email was sent by FileSure Templates<br>
        © 2025 FileSure. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const referralSignupEmailTemplate = (referrerName: string, referredName: string, referredEmail: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .highlight-box { background: #fff; padding: 20px; margin: 20px 0; border-left: 4px solid #f5576c; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎊 Someone Used Your Referral Link!</h1>
    </div>
    <div class="content">
      <h2>Great news, ${referrerName}! 🎉</h2>
      <p>A new user just signed up using your referral link!</p>

      <div class="highlight-box">
        <p><strong>New User:</strong> ${referredEmail}</p>
        <p style="color: #666; font-size: 14px; margin-top: 10px;">When they make their first purchase, you'll both earn <strong>2 credits</strong>!</p>
      </div>

      <h3>💡 What happens next?</h3>
      <ul>
        <li>Your referral status is now <strong>"Pending"</strong></li>
        <li>When ${referredEmail} makes their first purchase, you'll both get 2 credits</li>
        <li>You'll receive another email when they convert</li>
        <li>Track all your referrals on your dashboard</li>
      </ul>

      <p style="background: #fffbea; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin-top: 20px;">
        <strong>💰 Keep sharing!</strong> The more people you refer, the more credits you earn!
      </p>

      <div class="footer">
        <p>This email was sent by FileSure Templates<br>
        © 2025 FileSure. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const referralConversionEmailTemplate = (referrerName: string, referredEmail: string, creditsEarned: number) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .credits-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; margin: 20px 0; text-align: center; border-radius: 10px; }
    .credits-amount { font-size: 48px; font-weight: bold; margin: 10px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    .btn { display: inline-block; background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 You Earned Credits!</h1>
    </div>
    <div class="content">
      <h2>Congratulations, ${referrerName}! 💰</h2>
      <p>Your referral <strong>${referredEmail}</strong> just made their first purchase!</p>

      <div class="credits-box">
        <p style="margin: 0; font-size: 18px;">Credits Earned</p>
        <div class="credits-amount">+${creditsEarned}</div>
        <p style="margin: 0; opacity: 0.9;">Added to your account</p>
      </div>

      <h3>🌟 What can you do with credits?</h3>
      <ul>
        <li>Use credits for future purchases</li>
        <li>Unlock premium templates</li>
        <li>Get discounts on products</li>
        <li>Keep referring to earn more!</li>
      </ul>

      <p style="text-align: center;">
        <a href="http://localhost:3000/dashboard" class="btn">View Your Dashboard</a>
      </p>

      <p style="background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; border-radius: 4px; margin-top: 20px;">
        <strong>💡 Pro Tip:</strong> Share your referral link with more friends to keep earning credits!
      </p>

      <div class="footer">
        <p>This email was sent by FileSure Templates<br>
        © 2025 FileSure. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const firstPurchaseEmailTemplate = (name: string, creditsEarned: number, totalCredits: number) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .success-box { background: #fff; padding: 25px; margin: 20px 0; text-align: center; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .credits { font-size: 42px; font-weight: bold; color: #fa709a; margin: 15px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎊 Purchase Successful!</h1>
    </div>
    <div class="content">
      <h2>Thank you, ${name}! 🙏</h2>
      <p>Your purchase was successful and you've earned credits!</p>

      <div class="success-box">
        <p style="margin: 0; color: #666;">Credits Earned</p>
        <div class="credits">+${creditsEarned}</div>
        <hr style="border: none; border-top: 1px dashed #ddd; margin: 15px 0;">
        <p style="margin: 0; color: #666; font-size: 14px;">Total Credits</p>
        <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #333;">${totalCredits} Credits</p>
      </div>

      <h3>🎁 How to use your credits:</h3>
      <ul>
        <li>Apply credits to your next purchase</li>
        <li>Unlock exclusive templates</li>
        <li>Get discounts on premium products</li>
      </ul>

      <p style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin-top: 20px;">
        <strong>💰 Earn More Credits!</strong> Refer friends and earn 2 credits when they make their first purchase!
      </p>

      <div class="footer">
        <p>This email was sent by FileSure Templates<br>
        © 2025 FileSure. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
