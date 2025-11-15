# Deployment Guide - GazaPay Voice Assistant

This guide provides step-by-step instructions for deploying the GazaPay Voice Assistant to Vercel.

## Prerequisites

Before you begin, make sure you have:

1. ✅ A [GitHub account](https://github.com)
2. ✅ A [Vercel account](https://vercel.com) (free tier is fine)
3. ✅ An [OpenAI API key](https://platform.openai.com/api-keys)
4. ✅ Your project code pushed to a GitHub repository

## Step-by-Step Deployment to Vercel

### Step 1: Prepare Your Repository

1. **Initialize Git (if not already done)**

```bash
git init
git add .
git commit -m "Initial commit - GazaPay Voice Assistant"
```

2. **Create a GitHub Repository**

- Go to [github.com/new](https://github.com/new)
- Name: `gazapay-voice-assistant`
- Visibility: Private (recommended) or Public
- Click "Create repository"

3. **Push Your Code**

```bash
git remote add origin https://github.com/YOUR-USERNAME/gazapay-voice-assistant.git
git branch -M main
git push -u origin main
```

### Step 2: Connect Vercel to GitHub

1. **Go to Vercel Dashboard**

Visit [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Click "Add New Project"**

Click the "Add New..." button and select "Project"

3. **Import Git Repository**

- Select "GitHub" as your Git provider
- If first time: Click "Install Vercel" on GitHub and grant access
- Find and select your `gazapay-voice-assistant` repository
- Click "Import"

### Step 3: Configure Project Settings

1. **Framework Preset**

Vercel should auto-detect "Next.js" - leave this as is

2. **Root Directory**

Leave as `.` (root)

3. **Build and Output Settings**

Use defaults:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

4. **Environment Variables** (CRITICAL)

Click "Environment Variables" section and add:

| Key | Value | Environment |
|-----|-------|-------------|
| `OPENAI_API_KEY` | `sk-...your-key...` | Production, Preview, Development |

**⚠️ Important:** Make sure to select all three environments (Production, Preview, Development)

### Step 4: Deploy

1. **Click "Deploy"**

Vercel will now:
- Clone your repository
- Install dependencies
- Build your Next.js app
- Deploy to edge network

This takes 2-3 minutes on first deployment.

2. **Wait for "Congratulations!" Message**

You'll see a success screen with your deployment URL

### Step 5: Test Your Deployment

1. **Visit Your App**

Click the deployment URL (e.g., `https://gazapay-voice-assistant.vercel.app`)

2. **Test on Mobile**

- Open the URL on your mobile device
- Grant microphone permissions
- Try the hold-to-talk feature

3. **Test Voice Commands**

Try saying (in Arabic):
- "رصيدي" (my balance)
- "حول مئة أوقية إلى 12345678" (transfer 100 to 12345678)

### Step 6: Configure Custom Domain (Optional)

1. **Go to Project Settings**

Dashboard → Your Project → Settings → Domains

2. **Add Domain**

- Click "Add"
- Enter your domain: `voice.gazapay.com`
- Follow DNS configuration instructions

3. **Vercel Automatically Provisions SSL**

HTTPS will be enabled automatically (required for microphone access)

## Troubleshooting Deployment Issues

### Build Fails

**Error: "OpenAI API key not configured"**

Solution: Check that `OPENAI_API_KEY` is set in Environment Variables

**Error: "Module not found"**

Solution: 
```bash
# Clear cache and rebuild locally first
rm -rf .next node_modules
npm install
npm run build
```

### Runtime Errors

**Error: "Failed to transcribe"**

Possible causes:
1. Invalid OpenAI API key
2. Insufficient OpenAI credits
3. API rate limit exceeded

Solution: Check your [OpenAI usage dashboard](https://platform.openai.com/usage)

**Error: "Microphone not working"**

Causes:
1. Not using HTTPS (Vercel provides this automatically)
2. Browser doesn't support MediaRecorder API
3. User denied permissions

### Performance Issues

**Slow response times**

Solutions:
1. Upgrade to Vercel Pro for better edge regions
2. Implement caching for common responses
3. Use OpenAI's Realtime API for streaming

## Updating Your Deployment

### Automatic Deployments

Vercel automatically redeploys when you push to `main`:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Redeployment

1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" tab
3. Click "⋯" menu on latest deployment
4. Click "Redeploy"

## Environment Management

### Multiple Environments

Vercel provides three environments:

1. **Production** - Main deployment (`your-app.vercel.app`)
2. **Preview** - Branch deployments (`your-app-git-branch.vercel.app`)
3. **Development** - Local testing

### Managing Environment Variables

**Add a new variable:**
1. Settings → Environment Variables
2. Click "Add New"
3. Select target environments
4. Click "Save"
5. Redeploy for changes to take effect

**Update existing variable:**
1. Find the variable
2. Click "Edit"
3. Update value
4. Click "Save"
5. Redeploy

## Security Best Practices

### API Key Security

✅ **DO:**
- Store API keys in Vercel Environment Variables
- Use different keys for development/production
- Rotate keys periodically
- Monitor OpenAI usage dashboard

❌ **DON'T:**
- Commit `.env.local` to Git
- Share API keys in public repositories
- Use the same key across multiple projects

### Rate Limiting

For production use, implement rate limiting:

```typescript
// Example: Add to API routes
const rateLimit = 10; // requests per minute per IP
```

### CORS Configuration

The provided `vercel.json` allows all origins. For production:

```json
{
  "key": "Access-Control-Allow-Origin",
  "value": "https://your-domain.com"
}
```

## Monitoring & Analytics

### Vercel Analytics

1. Go to Project Settings → Analytics
2. Enable Web Analytics (free)
3. Monitor page views, performance

### OpenAI Usage

Monitor costs at [platform.openai.com/usage](https://platform.openai.com/usage)

### Error Tracking

View runtime errors:
1. Dashboard → Your Project
2. Click "Logs" tab
3. Filter by error severity

## Scaling Considerations

### Free Tier Limits

Vercel Free Tier includes:
- 100 GB bandwidth/month
- Unlimited API routes
- Automatic SSL
- Edge network

### When to Upgrade

Consider Vercel Pro ($20/month) if you need:
- Custom domains
- More team members
- Advanced analytics
- Priority support

### OpenAI Costs

Estimated costs per 1000 interactions:
- Whisper (transcription): $0.36
- TTS (speech): $15.00
- **Total: ~$15.36 per 1000 voice interactions**

Budget accordingly based on expected usage.

## Backup & Recovery

### Backup Strategy

1. **Code:** Stored in GitHub (already backed up)
2. **Environment Variables:** Export from Vercel dashboard
3. **Session Data:** Currently in-memory (consider Redis for persistence)

### Disaster Recovery

If deployment fails:
1. Check recent commits
2. Revert to last working version:
   ```bash
   git revert HEAD
   git push origin main
   ```
3. Vercel will auto-deploy the reverted version

## Support & Resources

### Vercel Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)

### OpenAI Documentation

- [Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [TTS API](https://platform.openai.com/docs/guides/text-to-speech)
- [API Reference](https://platform.openai.com/docs/api-reference)

### Getting Help

1. Check [Vercel Status](https://vercel-status.com)
2. Visit [Vercel Community](https://github.com/vercel/vercel/discussions)
3. Contact [Vercel Support](https://vercel.com/support)

---

## Quick Reference

### Essential Commands

```bash
# Local development
npm run dev

# Build locally
npm run build

# Start production server locally
npm start

# Deploy via CLI (optional)
vercel --prod
```

### Important URLs

- **Vercel Dashboard:** https://vercel.com/dashboard
- **OpenAI Dashboard:** https://platform.openai.com
- **Project Settings:** https://vercel.com/[your-username]/gazapay-voice-assistant/settings

### Environment Variables Checklist

- [ ] `OPENAI_API_KEY` set in Vercel
- [ ] Variable applied to all environments
- [ ] `.env.local` exists locally
- [ ] `.env.local` is in `.gitignore`

---

**You're all set! 🚀**

Your GazaPay Voice Assistant is now live and ready to handle voice banking commands.

