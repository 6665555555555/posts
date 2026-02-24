const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');

// النشر على Twitter
async function publishToTwitter(twitterConfig, content, imageUrl) {
  try {
    const client = new TwitterApi({
      appKey: twitterConfig.apiKey,
      appSecret: twitterConfig.apiSecret,
      accessToken: twitterConfig.accessToken,
      accessSecret: twitterConfig.accessTokenSecret,
    });

    let mediaId;

    // رفع الصورة إذا وجدت
    if (imageUrl) {
      const media = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(media.data, 'binary');
      const uploadedMedia = await client.v1.uploadMedia(buffer, { type: 'image' });
      mediaId = uploadedMedia;
    }

    // نشر التغريدة
    const tweet = await client.v2.tweet(content, {
      media: mediaId ? { media_ids: [mediaId] } : undefined
    });

    return {
      success: true,
      postId: tweet.data.id,
      url: `https://twitter.com/user/status/${tweet.data.id}`
    };
  } catch (error) {
    console.error('خطأ في النشر على Twitter:', error);
    throw new Error('فشل النشر على Twitter: ' + error.message);
  }
}

// النشر على Facebook
async function publishToFacebook(facebookConfig, content, imageUrl) {
  try {
    const url = `https://graph.facebook.com/v17.0/me/feed`;
    const params = {
      message: content,
      access_token: facebookConfig.accessToken
    };

    // إضافة الصورة إذا وجدت
    if (imageUrl) {
      params.url = imageUrl;
      params.caption = content;

      const response = await axios.post(
        `https://graph.facebook.com/v17.0/me/photos`,
        null,
        { params }
      );

      return {
        success: true,
        postId: response.data.id,
        url: `https://facebook.com/${response.data.post_id || response.data.id}`
      };
    }

    const response = await axios.post(url, null, { params });

    return {
      success: true,
      postId: response.data.id,
      url: `https://facebook.com/${response.data.id}`
    };
  } catch (error) {
    console.error('خطأ في النشر على Facebook:', error);
    throw new Error('فشل النشر على Facebook: ' + error.message);
  }
}

// النشر على Instagram
async function publishToInstagram(instagramConfig, content, imageUrl) {
  try {
    if (!imageUrl) {
      throw new Error('يجب إضافة صورة للنشر على Instagram');
    }

    // إنشاء حاوية للوسائط
    const containerResponse = await axios.post(
      `https://graph.facebook.com/v17.0/${instagramConfig.appId}/media`,
      null,
      {
        params: {
          image_url: imageUrl,
          caption: content,
          access_token: instagramConfig.accessToken
        }
      }
    );

    const containerId = containerResponse.data.id;

    // نشر الحاوية
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v17.0/${instagramConfig.appId}/media_publish`,
      null,
      {
        params: {
          creation_id: containerId,
          access_token: instagramConfig.accessToken
        }
      }
    );

    return {
      success: true,
      postId: publishResponse.data.id,
      url: `https://instagram.com/p/${publishResponse.data.id}`
    };
  } catch (error) {
    console.error('خطأ في النشر على Instagram:', error);
    throw new Error('فشل النشر على Instagram: ' + error.message);
  }
}

// النشر على LinkedIn
async function publishToLinkedIn(linkedinConfig, content, imageUrl) {
  try {
    // الحصول على معرف المستخدم
    const userResponse = await axios.get(
      'https://api.linkedin.com/v2/me',
      {
        headers: {
          'Authorization': `Bearer ${linkedinConfig.accessToken}`
        }
      }
    );

    const personUrn = userResponse.data.id;

    // إنشاء منشور
    const postResponse = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: `urn:li:person:${personUrn}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${linkedinConfig.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    return {
      success: true,
      postId: postResponse.data.id,
      url: `https://linkedin.com/feed/update/${postResponse.data.id}`
    };
  } catch (error) {
    console.error('خطأ في النشر على LinkedIn:', error);
    throw new Error('فشل النشر على LinkedIn: ' + error.message);
  }
}

// الحصول على إحصائيات Twitter
async function getTwitterStats(twitterConfig) {
  try {
    const client = new TwitterApi({
      appKey: twitterConfig.apiKey,
      appSecret: twitterConfig.apiSecret,
      accessToken: twitterConfig.accessToken,
      accessSecret: twitterConfig.accessTokenSecret,
    });

    // الحصول على معلومات المستخدم
    const user = await client.v2.me({
      'user.fields': ['public_metrics']
    });

    return {
      followers: user.data.public_metrics.followers_count,
      following: user.data.public_metrics.following_count,
      tweets: user.data.public_metrics.tweet_count,
      likes: user.data.public_metrics.like_count
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات Twitter:', error);
    throw new Error('فشل الحصول على إحصائيات Twitter: ' + error.message);
  }
}

// الحصول على إحصائيات Facebook
async function getFacebookStats(facebookConfig) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v17.0/me`,
      {
        params: {
          fields: 'id,name,friends.summary(true)',
          access_token: facebookConfig.accessToken
        }
      }
    );

    return {
      id: response.data.id,
      name: response.data.name,
      friends: response.data.friends ? response.data.friends.summary.total_count : 0
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات Facebook:', error);
    throw new Error('فشل الحصول على إحصائيات Facebook: ' + error.message);
  }
}

// الحصول على إحصائيات Instagram
async function getInstagramStats(instagramConfig) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v17.0/me`,
      {
        params: {
          fields: 'id,username,followers_count,follows_count,media_count',
          access_token: instagramConfig.accessToken
        }
      }
    );

    return {
      id: response.data.id,
      username: response.data.username,
      followers: response.data.followers_count,
      following: response.data.follows_count,
      posts: response.data.media_count
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات Instagram:', error);
    throw new Error('فشل الحصول على إحصائيات Instagram: ' + error.message);
  }
}

// الحصول على إحصائيات LinkedIn
async function getLinkedInStats(linkedinConfig) {
  try {
    const response = await axios.get(
      'https://api.linkedin.com/v2/me',
      {
        headers: {
          'Authorization': `Bearer ${linkedinConfig.accessToken}`
        }
      }
    );

    return {
      id: response.data.id,
      localizedFirstName: response.data.localizedFirstName,
      localizedLastName: response.data.localizedLastName
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات LinkedIn:', error);
    throw new Error('فشل الحصول على إحصائيات LinkedIn: ' + error.message);
  }
}

module.exports = {
  publishToTwitter,
  publishToFacebook,
  publishToInstagram,
  publishToLinkedIn,
  getTwitterStats,
  getFacebookStats,
  getInstagramStats,
  getLinkedInStats
};
