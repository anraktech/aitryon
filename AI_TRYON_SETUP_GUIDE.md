# AI Try-On Shopify App - Complete Setup Guide

## 🚀 Overview
This Shopify app provides two powerful AI-powered virtual try-on experiences:
1. **Product Page Extension**: Try individual products directly on product pages
2. **Homepage Extension**: Personalize the entire shopping experience with all products customized to the user

## ✨ Features

### Core Functionality
- **Apple-style UI**: Premium, professional interface inspired by Apple's design language
- **Dual Extensions**: Product-specific and site-wide personalization options
- **Real-time Analytics**: Track successful/failed generations and system performance
- **Secure API Management**: Encrypted OpenRouter API key storage
- **Error Handling**: Professional error messages with random compliments/feedback
- **Mobile Responsive**: Works seamlessly across all device sizes

### Technical Stack
- **Frontend**: Remix + React + TypeScript
- **UI Framework**: Shopify Polaris + Custom Apple-inspired CSS
- **Database**: SQLite with Prisma ORM
- **AI Integration**: OpenRouter API via webhook
- **Authentication**: Shopify OAuth with session management

## 🛠️ Installation & Setup

### Prerequisites
1. **Shopify Partner Account**: Required for app development
2. **Development Store**: For testing the app
3. **OpenRouter Account**: For AI image generation
4. **Node.js**: Version 18+ recommended

### Step 1: Install Dependencies
```bash
cd my-shopify-app
npm install
```

### Step 2: Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Create/update database
npx prisma db push
```

### Step 3: Configure Environment
Create a `.env` file with:
```env
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
DATABASE_URL="file:./dev.sqlite"
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Install on Development Store
1. Follow the authentication prompts in terminal
2. Select your Partner organization
3. Install on your development store
4. Configure OpenRouter API key in settings

## 📋 OpenRouter Setup

### Getting Your API Key
1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up or log in
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-...`)

### Adding to Your App
1. Open your app in Shopify admin
2. Go to "AI Try-On Settings"
3. Paste your API key
4. Save settings

### Managing Credits
- Monitor usage in OpenRouter dashboard
- Set up alerts for low credits
- Check analytics in your Shopify app

## 🎨 Extension Configuration

### Product Page Extension
**Location**: Product pages
**Features**:
- Try-on button with customizable text/color
- Apple-style popup modal
- Individual product personalization
- Add to cart integration

**Theme Integration**:
```liquid
<!-- Add to product pages -->
{% render 'ai-tryon-button' %}
```

### Homepage Extension
**Location**: Homepage
**Features**:
- Personalization hero button
- Site-wide product image replacement
- Batch processing with progress indicators
- Enhanced loading animations

**Theme Integration**:
```liquid
<!-- Add to homepage -->
{% render 'ai-tryon-homepage' %}
```

## 🔧 Customization Options

### Button Styling
```css
.ai-tryon-button {
  /* Customize colors */
  --primary-color: #007AFF;
  --hover-color: #0051D5;
  
  /* Customize sizing */
  padding: 14px 28px;
  font-size: 17px;
  border-radius: 12px;
}
```

### Modal Theming
```css
.ai-modal-content {
  /* Customize modal appearance */
  border-radius: 24px;
  max-width: 500px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}
```

### Error Messages
Edit in `ai-tryon.js`:
```javascript
const ERROR_MESSAGES = [
  { title: "Custom Title!", message: "Your custom error message" }
];
```

## 📊 Analytics Dashboard

### Key Metrics
- **Total Generations**: All AI try-on attempts
- **Success Rate**: Percentage of successful generations
- **Failed Attempts**: Track issues and optimize
- **Real-time Updates**: 30-second refresh intervals

### Performance Monitoring
- **System Status**: API connectivity checks
- **Credit Warnings**: OpenRouter balance alerts
- **Usage Patterns**: Peak hours and trends

### Accessing Analytics
1. Open your Shopify app
2. Navigate to "AI Try-On Analytics"
3. View real-time metrics and performance data

## 🔐 Security Features

### API Key Protection
- Encrypted storage in database
- Masked display in UI (shows first/last 4 characters)
- Secure transmission to webhook

### Session Management
- Shopify OAuth integration
- Automatic session refresh
- Secure token storage

### Error Handling
- Graceful degradation on API failures
- User-friendly error messages
- Automatic retry mechanisms

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Platform
```bash
# Example for Heroku
git add .
git commit -m "Deploy AI Try-On app"
git push heroku main
```

### Environment Variables
Set in production:
- `DATABASE_URL`: Production database
- `SHOPIFY_API_KEY`: Production app key
- `SHOPIFY_API_SECRET`: Production app secret

## 🧪 Testing

### Manual Testing Checklist
- [ ] Install app on development store
- [ ] Configure OpenRouter API key
- [ ] Test product page try-on flow
- [ ] Test homepage personalization
- [ ] Verify analytics tracking
- [ ] Test error scenarios
- [ ] Check mobile responsiveness

### Test Cases
1. **Successful Generation**:
   - Upload valid image
   - Verify webhook call
   - Check result display
   - Test add to cart

2. **Error Handling**:
   - Invalid image format
   - API key issues
   - Network failures
   - Rate limiting

3. **Analytics**:
   - Verify success tracking
   - Check failure logging
   - Test real-time updates

## 🐛 Troubleshooting

### Common Issues

#### API Key Not Working
- Verify key format (starts with `sk-or-v1-`)
- Check OpenRouter credit balance
- Ensure key has correct permissions

#### Extensions Not Appearing
- Check extension installation in Partner Dashboard
- Verify theme compatibility
- Ensure proper liquid integration

#### Webhook Failures
- Test webhook URL accessibility
- Check n8n workflow status
- Verify payload format

#### Database Issues
- Run `npx prisma db push`
- Check SQLite file permissions
- Verify schema migrations

### Debug Mode
Enable detailed logging:
```javascript
// In ai-tryon.js
const DEBUG = true;
console.log('Debug info:', payload);
```

## 📈 Performance Optimization

### Image Processing
- Compress images before sending
- Implement retry logic for failures
- Cache successful results

### User Experience
- Show loading states immediately
- Provide progress feedback
- Optimize animation performance

### API Usage
- Batch similar requests
- Implement rate limiting
- Monitor credit consumption

## 🔄 Updates & Maintenance

### Regular Tasks
- Monitor OpenRouter credits
- Review analytics data
- Update error messages seasonally
- Check for Shopify API updates

### Version Updates
- Follow semantic versioning
- Test thoroughly before deployment
- Update documentation
- Notify users of new features

## 🎯 Success Metrics

### KPIs to Track
- **Engagement Rate**: % of users trying the feature
- **Conversion Rate**: Try-on to purchase ratio
- **Success Rate**: Technical performance metric
- **User Satisfaction**: Based on retry patterns

### Monthly Review
- Analyze usage patterns
- Optimize error messages
- Review OpenRouter costs
- Plan feature improvements

## 📞 Support

### For Developers
- Check CLAUDE.md for implementation details
- Review Shopify documentation
- Test in development environment first

### For Merchants
- OpenRouter credit monitoring
- Feature usage training
- Analytics interpretation

### Emergency Contacts
- OpenRouter API issues: Check status page
- Shopify platform issues: Partner support
- App-specific issues: Review error logs

---

## 🎉 Congratulations!

You've successfully set up a production-ready AI Try-On Shopify app with professional Apple-style UI, comprehensive analytics, and robust error handling. Your customers can now enjoy personalized shopping experiences with cutting-edge AI technology!

**Next Steps:**
1. Deploy to production
2. Submit for Shopify App Store review
3. Monitor performance metrics
4. Iterate based on user feedback

**Remember to:**
- Keep OpenRouter credits funded
- Monitor analytics regularly
- Update error messages seasonally
- Test new features thoroughly

Happy selling! 🛍️✨