const User = require('../models/User');
const Post = require('../models/Post');
const {
  publishToTwitter,
  publishToFacebook,
  publishToInstagram,
  publishToLinkedIn,
  getTwitterStats,
  getFacebookStats,
  getInstagramStats,
  getLinkedInStats
} = require('../helpers/socialMediaHelper');

// الحصول على حالة الاتصال بمنصات التواصل الاجتماعي
exports.getConnectionStatus = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // استخراج حالة الاتصال لكل منصة
    const platforms = {
      twitter: user.connectedPlatforms.twitter?.connected || false,
      facebook: user.connectedPlatforms.facebook?.connected || false,
      instagram: user.connectedPlatforms.instagram?.connected || false,
      linkedin: user.connectedPlatforms.linkedin?.connected || false
    };

    res.json({ platforms });
  } catch (error) {
    console.error('خطأ في الحصول على حالة الاتصال:', error);
    res.status(500).json({ message: 'حدث خطأ في الحصول على حالة الاتصال', error: error.message });
  }
};

// نشر منشور على منصة واحدة
exports.publishToPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    const { content, imageUrl } = req.body;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // التحقق من اتصال المنصة
    if (!user.connectedPlatforms[platform] || !user.connectedPlatforms[platform].connected) {
      return res.status(400).json({ message: `حساب ${platform} غير متصل` });
    }

    let result;

    // النشر على المنصة المحددة
    switch (platform) {
      case 'twitter':
        result = await publishToTwitter(user.connectedPlatforms.twitter, content, imageUrl);
        break;
      case 'facebook':
        result = await publishToFacebook(user.connectedPlatforms.facebook, content, imageUrl);
        break;
      case 'instagram':
        result = await publishToInstagram(user.connectedPlatforms.instagram, content, imageUrl);
        break;
      case 'linkedin':
        result = await publishToLinkedIn(user.connectedPlatforms.linkedin, content, imageUrl);
        break;
      default:
        return res.status(400).json({ message: 'منصة غير صالحة' });
    }

    // حفظ المنشور في قاعدة البيانات
    const newPost = new Post({
      userId: user._id,
      content,
      imageUrl,
      platforms: [platform],
      platformPostIds: {
        [platform]: result.postId
      },
      publishedAt: new Date(),
      status: 'published'
    });

    await newPost.save();

    res.json({
      message: `تم النشر على ${platform} بنجاح`,
      post: newPost,
      platformResult: result
    });
  } catch (error) {
    console.error(`خطأ في النشر على ${req.params.platform}:`, error);
    res.status(500).json({ message: `حدث خطأ في النشر على ${req.params.platform}`, error: error.message });
  }
};

// نشر منشور على عدة منصات
exports.publishToMultiplePlatforms = async (req, res) => {
  try {
    const { platforms, content, imageUrl } = req.body;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // التحقق من صحة المنصات
    const validPlatforms = ['twitter', 'facebook', 'instagram', 'linkedin'];
    const platformsToPublish = platforms.filter(p => validPlatforms.includes(p));

    if (platformsToPublish.length === 0) {
      return res.status(400).json({ message: 'لم يتم تحديد أي منصة صالحة للنشر' });
    }

    // التحقق من اتصال المنصات
    const disconnectedPlatforms = platformsToPublish.filter(
      p => !user.connectedPlatforms[p] || !user.connectedPlatforms[p].connected
    );

    if (disconnectedPlatforms.length > 0) {
      return res.status(400).json({ 
        message: 'بعض المنصات غير متصلة',
        disconnectedPlatforms
      });
    }

    const results = {};
    const platformPostIds = {};

    // النشر على كل منصة
    for (const platform of platformsToPublish) {
      try {
        let result;
        switch (platform) {
          case 'twitter':
            result = await publishToTwitter(user.connectedPlatforms.twitter, content, imageUrl);
            break;
          case 'facebook':
            result = await publishToFacebook(user.connectedPlatforms.facebook, content, imageUrl);
            break;
          case 'instagram':
            result = await publishToInstagram(user.connectedPlatforms.instagram, content, imageUrl);
            break;
          case 'linkedin':
            result = await publishToLinkedIn(user.connectedPlatforms.linkedin, content, imageUrl);
            break;
        }

        results[platform] = result;
        platformPostIds[platform] = result.postId;
      } catch (error) {
        console.error(`خطأ في النشر على ${platform}:`, error);
        results[platform] = { success: false, error: error.message };
      }
    }

    // حفظ المنشور في قاعدة البيانات
    const newPost = new Post({
      userId: user._id,
      content,
      imageUrl,
      platforms: platformsToPublish,
      platformPostIds,
      publishedAt: new Date(),
      status: 'published'
    });

    await newPost.save();

    res.json({
      message: 'تم النشر على المنصات المحددة',
      post: newPost,
      results
    });
  } catch (error) {
    console.error('خطأ في النشر المتعدد:', error);
    res.status(500).json({ message: 'حدث خطأ في النشر المتعدد', error: error.message });
  }
};

// الحصول على إحصائيات المنشورات
exports.getPostStats = async (req, res) => {
  try {
    const { platform } = req.params;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // التحقق من اتصال المنصة
    if (!user.connectedPlatforms[platform] || !user.connectedPlatforms[platform].connected) {
      return res.status(400).json({ message: `حساب ${platform} غير متصل` });
    }

    // الحصول على إحصائيات المنشورات من المنصة
    let stats;
    switch (platform) {
      case 'twitter':
        stats = await getTwitterStats(user.connectedPlatforms.twitter);
        break;
      case 'facebook':
        stats = await getFacebookStats(user.connectedPlatforms.facebook);
        break;
      case 'instagram':
        stats = await getInstagramStats(user.connectedPlatforms.instagram);
        break;
      case 'linkedin':
        stats = await getLinkedInStats(user.connectedPlatforms.linkedin);
        break;
      default:
        return res.status(400).json({ message: 'منصة غير صالحة' });
    }

    res.json({ platform, stats });
  } catch (error) {
    console.error(`خطأ في الحصول على إحصائيات ${req.params.platform}:`, error);
    res.status(500).json({ message: `حدث خطأ في الحصول على الإحصائيات`, error: error.message });
  }
};

// الحصول على قائمة المنشورات
exports.getPosts = async (req, res) => {
  try {
    const { platform } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير });
    }

    // التحقق من اتصال المنصة
    if (!user.connectedPlatforms[platform] || !user.connectedPlatforms[platform].connected) {
      return res.status(400).json({ message: `حساب ${platform} غير متصل` });
    }

    // الحصول على المنشورات من المنصة
    let posts;
    switch (platform) {
      case 'twitter':
        posts = await getTwitterPosts(user.connectedPlatforms.twitter, limit, offset);
        break;
      case 'facebook':
        posts = await getFacebookPosts(user.connectedPlatforms.facebook, limit, offset);
        break;
      case 'instagram':
        posts = await getInstagramPosts(user.connectedPlatforms.instagram, limit, offset);
        break;
      case 'linkedin':
        posts = await getLinkedInPosts(user.connectedPlatforms.linkedin, limit, offset);
        break;
      default:
        return res.status(400).json({ message: 'منصة غير صالحة' });
    }

    res.json({ platform, posts });
  } catch (error) {
    console.error(`خطأ في الحصول على منشورات ${req.params.platform}:`, error);
    res.status(500).json({ message: `حدث خطأ في الحصول على المنشورات`, error: error.message });
  }
};

// حذف منشور
exports.deletePost = async (req, res) => {
  try {
    const { platform, postId } = req.params;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // التحقق من اتصال المنصة
    if (!user.connectedPlatforms[platform] || !user.connectedPlatforms[platform].connected) {
      return res.status(400).json({ message: `حساب ${platform} غير متصل` });
    }

    // حذف المنشور من المنصة
    let result;
    switch (platform) {
      case 'twitter':
        result = await deleteTwitterPost(user.connectedPlatforms.twitter, postId);
        break;
      case 'facebook':
        result = await deleteFacebookPost(user.connectedPlatforms.facebook, postId);
        break;
      case 'instagram':
        result = await deleteInstagramPost(user.connectedPlatforms.instagram, postId);
        break;
      case 'linkedin':
        result = await deleteLinkedInPost(user.connectedPlatforms.linkedin, postId);
        break;
      default:
        return res.status(400).json({ message: 'منصة غير صالحة' });
    }

    // تحديث المنشور في قاعدة البيانات
    const post = await Post.findOne({ 
      userId: user._id,
      [`platformPostIds.${platform}`]: postId
    });

    if (post) {
      delete post.platformPostIds[platform];
      post.platforms = post.platforms.filter(p => p !== platform);

      if (post.platforms.length === 0) {
        await Post.findByIdAndDelete(post._id);
      } else {
        await post.save();
      }
    }

    res.json({ message: `تم حذف المنشور من ${platform} بنجاح`, result });
  } catch (error) {
    console.error(`خطأ في حذف منشور من ${req.params.platform}:`, error);
    res.status(500).json({ message: `حدث خطأ في حذف المنشور`, error: error.message });
  }
};

// دوال مساعدة للنشر على منصات مختلفة

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
      url: `https://twitter.com/i/web/status/${tweet.data.id}`
    };
  } catch (error) {
    console.error('خطأ في النشر على Twitter:', error);
    throw new Error(`فشل النشر على Twitter: ${error.message}`);
  }
}

// النشر على Facebook
async function publishToFacebook(facebookConfig, content, imageUrl) {
  try {
    const url = `https://graph.facebook.com/me/feed`;
    const params = {
      message: content,
      access_token: facebookConfig.accessToken
    };

    if (imageUrl) {
      params.url = imageUrl;
    }

    const response = await axios.post(url, params);

    return {
      success: true,
      postId: response.data.id,
      url: `https://facebook.com/${response.data.id}`
    };
  } catch (error) {
    console.error('خطأ في النشر على Facebook:', error);
    throw new Error(`فشل النشر على Facebook: ${error.message}`);
  }
}

// النشر على Instagram
async function publishToInstagram(instagramConfig, content, imageUrl) {
  try {
    // أولاً، إنشاء حاوية وسائط
    const containerUrl = `https://graph.facebook.com/v17.0/me/media`;
    const containerParams = {
      caption: content,
      image_url: imageUrl,
      access_token: instagramConfig.accessToken
    };

    const containerResponse = await axios.post(containerUrl, containerParams);
    const containerId = containerResponse.data.id;

    // ثانياً، نشر الحاوية
    const publishUrl = `https://graph.facebook.com/v17.0/me/media_publish`;
    const publishParams = {
      creation_id: containerId,
      access_token: instagramConfig.accessToken
    };

    const publishResponse = await axios.post(publishUrl, publishParams);

    return {
      success: true,
      postId: publishResponse.data.id,
      url: `https://instagram.com/p/${publishResponse.data.id}`
    };
  } catch (error) {
    console.error('خطأ في النشر على Instagram:', error);
    throw new Error(`فشل النشر على Instagram: ${error.message}`);
  }
}

// النشر على LinkedIn
async function publishToLinkedIn(linkedinConfig, content, imageUrl) {
  try {
    const personUrl = 'https://api.linkedin.com/v2/me';
    const personResponse = await axios.get(personUrl, {
      headers: {
        'Authorization': `Bearer ${linkedinConfig.accessToken}`
      }
    });

    const personUrn = personResponse.data.id;

    // إنشاء المنشور
    const postUrl = 'https://api.linkedin.com/v2/ugcPosts';
    const postBody = {
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
    };

    if (imageUrl) {
      // رفع الصورة والحصول على URN
      const registerUploadUrl = 'https://api.linkedin.com/v2/assets?action=registerUpload';
      const registerBody = {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaAsset:urn:li:digitalmediaMediaArtifactImage'],
          owner: `urn:li:person:${personUrn}`,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }
          ]
        }
      };

      const registerResponse = await axios.post(registerUploadUrl, registerBody, {
        headers: {
          'Authorization': `Bearer ${linkedinConfig.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const assetUrn = registerResponse.data.value.asset;

      // رفع الصورة
      await axios.put(uploadUrl, await axios.get(imageUrl, { responseType: 'arraybuffer' }).then(res => res.data), {
        headers: {
          'Authorization': `Bearer ${linkedinConfig.accessToken}`,
          'Content-Type': 'application/octet-stream'
        }
      });

      // إضافة الصورة إلى المنشور
      postBody.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          description: {
            text: content
          },
          media: `urn:li:digitalmediaAsset:${assetUrn}`,
          title: {
            text: 'صورة'
          }
        }
      ];
    }

    const postResponse = await axios.post(postUrl, postBody, {
      headers: {
        'Authorization': `Bearer ${linkedinConfig.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    return {
      success: true,
      postId: postResponse.data.id,
      url: `https://www.linkedin.com/feed/update/${postResponse.data.id}`
    };
  } catch (error) {
    console.error('خطأ في النشر على LinkedIn:', error);
    throw new Error(`فشل النشر على LinkedIn: ${error.message}`);
  }
}

// دوال مساعدة للحصول على إحصائيات المنشورات

async function getTwitterStats(twitterConfig) {
  try {
    const client = new TwitterApi({
      appKey: twitterConfig.apiKey,
      appSecret: twitterConfig.apiSecret,
      accessToken: twitterConfig.accessToken,
      accessSecret: twitterConfig.accessTokenSecret,
    });

    const user = await client.v2.me({
      'user.fields': ['public_metrics']
    });

    return {
      followers: user.data.public_metrics.followers_count,
      following: user.data.public_metrics.following_count,
      tweets: user.data.public_metrics.tweet_count,
      listed: user.data.public_metrics.listed_count
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات Twitter:', error);
    throw new Error(`فشل الحصول على إحصائيات Twitter: ${error.message}`);
  }
}

async function getFacebookStats(facebookConfig) {
  try {
    const url = `https://graph.facebook.com/me`;
    const params = {
      fields: 'id,name,friends.summary(true)',
      access_token: facebookConfig.accessToken
    };

    const response = await axios.get(url, { params });

    return {
      id: response.data.id,
      name: response.data.name,
      friends: response.data.friends?.summary?.total_count || 0
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات Facebook:', error);
    throw new Error(`فشل الحصول على إحصائيات Facebook: ${error.message}`);
  }
}

async function getInstagramStats(instagramConfig) {
  try {
    const url = `https://graph.facebook.com/me`;
    const params = {
      fields: 'id,username,followers_count,follows_count,media_count',
      access_token: instagramConfig.accessToken
    };

    const response = await axios.get(url, { params });

    return {
      id: response.data.id,
      username: response.data.username,
      followers: response.data.followers_count,
      following: response.data.follows_count,
      posts: response.data.media_count
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات Instagram:', error);
    throw new Error(`فشل الحصول على إحصائيات Instagram: ${error.message}`);
  }
}

async function getLinkedInStats(linkedinConfig) {
  try {
    const personUrl = 'https://api.linkedin.com/v2/me';
    const personResponse = await axios.get(personUrl, {
      headers: {
        'Authorization': `Bearer ${linkedinConfig.accessToken}`
      }
    });

    const connectionsUrl = 'https://api.linkedin.com/v2/connections';
    const connectionsResponse = await axios.get(connectionsUrl, {
      headers: {
        'Authorization': `Bearer ${linkedinConfig.accessToken}`
      }
    });

    return {
      id: personResponse.data.id,
      connections: connectionsResponse.data?.total || 0
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات LinkedIn:', error);
    throw new Error(`فشل الحصول على إحصائيات LinkedIn: ${error.message}`);
  }
}

// دوال مساعدة للحصول على المنشورات

async function getTwitterPosts(twitterConfig, limit, offset) {
  try {
    const client = new TwitterApi({
      appKey: twitterConfig.apiKey,
      appSecret: twitterConfig.apiSecret,
      accessToken: twitterConfig.accessToken,
      accessSecret: twitterConfig.accessTokenSecret,
    });

    const tweets = await client.v2.userTimeline(req.session.user.id, {
      max_results: limit,
      pagination_token: offset
    });

    return tweets.data.data.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      url: `https://twitter.com/i/web/status/${tweet.id}`
    }));
  } catch (error) {
    console.error('خطأ في الحصول على منشورات Twitter:', error);
    throw new Error(`فشل الحصول على منشورات Twitter: ${error.message}`);
  }
}

async function getFacebookPosts(facebookConfig, limit, offset) {
  try {
    const url = `https://graph.facebook.com/me/posts`;
    const params = {
      limit,
      offset,
      access_token: facebookConfig.accessToken
    };

    const response = await axios.get(url, { params });

    return response.data.data.map(post => ({
      id: post.id,
      message: post.message,
      created_time: post.created_time,
      url: `https://facebook.com/${post.id}`
    }));
  } catch (error) {
    console.error('خطأ في الحصول على منشورات Facebook:', error);
    throw new Error(`فشل الحصول على منشورات Facebook: ${error.message}`);
  }
}

async function getInstagramPosts(instagramConfig, limit, offset) {
  try {
    const url = `https://graph.facebook.com/me/media`;
    const params = {
      fields: 'id,caption,media_type,media_url,permalink,timestamp',
      limit,
      after: offset,
      access_token: instagramConfig.accessToken
    };

    const response = await axios.get(url, { params });

    return response.data.data.map(post => ({
      id: post.id,
      caption: post.caption,
      media_type: post.media_type,
      media_url: post.media_url,
      permalink: post.permalink,
      timestamp: post.timestamp
    }));
  } catch (error) {
    console.error('خطأ في الحصول على منشورات Instagram:', error);
    throw new Error(`فشل الحصول على منشورات Instagram: ${error.message}`);
  }
}

async function getLinkedInPosts(linkedinConfig, limit, offset) {
  try {
    const personUrl = 'https://api.linkedin.com/v2/me';
    const personResponse = await axios.get(personUrl, {
      headers: {
        'Authorization': `Bearer ${linkedinConfig.accessToken}`
      }
    });

    const personUrn = personResponse.data.id;

    const postsUrl = `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:person:${personUrn})`;
    const postsResponse = await axios.get(postsUrl, {
      headers: {
        'Authorization': `Bearer ${linkedinConfig.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      },
      params: {
        count: limit,
        start: offset
      }
    });

    return postsResponse.data.elements.map(post => ({
      id: post.id,
      text: post.specificContent['com.linkedin.ugc.ShareContent'].shareCommentary.text,
      created_at: post.created.time,
      url: post.specificContent['com.linkedin.ugc.ShareContent'].shareUrl
    }));
  } catch (error) {
    console.error('خطأ في الحصول على منشورات LinkedIn:', error);
    throw new Error(`فشل الحصول على منشورات LinkedIn: ${error.message}`);
  }
}

// دوال مساعدة لحذف المنشورات

async function deleteTwitterPost(twitterConfig, postId) {
  try {
    const client = new TwitterApi({
      appKey: twitterConfig.apiKey,
      appSecret: twitterConfig.apiSecret,
      accessToken: twitterConfig.accessToken,
      accessSecret: twitterConfig.accessTokenSecret,
    });

    await client.v2.deleteTweet(postId);

    return { success: true, message: 'تم حذف التغريدة بنجاح' };
  } catch (error) {
    console.error('خطأ في حذف تغريدة Twitter:', error);
    throw new Error(`فشل حذف التغريدة: ${error.message}`);
  }
}

async function deleteFacebookPost(facebookConfig, postId) {
  try {
    const url = `https://graph.facebook.com/${postId}`;
    const params = {
      access_token: facebookConfig.accessToken
    };

    await axios.delete(url, { params });

    return { success: true, message: 'تم حذف المنشور بنجاح' };
  } catch (error) {
    console.error('خطأ في حذف منشور Facebook:', error);
    throw new Error(`فشل حذف المنشور: ${error.message}`);
  }
}

async function deleteInstagramPost(instagramConfig, postId) {
  try {
    const url = `https://graph.facebook.com/${postId}`;
    const params = {
      access_token: instagramConfig.accessToken
    };

    await axios.delete(url, { params });

    return { success: true, message: 'تم حذف المنشور بنجاح' };
  } catch (error) {
    console.error('خطأ في حذف منشور Instagram:', error);
    throw new Error(`فشل حذف المنشور: ${error.message}`);
  }
}

async function deleteLinkedInPost(linkedinConfig, postId) {
  try {
    const url = `https://api.linkedin.com/v2/ugcPosts/${postId}`;

    await axios.delete(url, {
      headers: {
        'Authorization': `Bearer ${linkedinConfig.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    return { success: true, message: 'تم حذف المنشور بنجاح' };
  } catch (error) {
    console.error('خطأ في حذف منشور LinkedIn:', error);
    throw new Error(`فشل حذف المنشور: ${error.message}`);
  }
}
