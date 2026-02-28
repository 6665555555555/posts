// API Configuration
const API_BASE_URL = 'https://graph.facebook.com/v17.0'; // Facebook Graph API endpoint
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'; // YouTube API endpoint
const LINKEDIN_API_BASE_URL = 'https://api.linkedin.com/v2'; // LinkedIn API endpoint
const TIKTOK_API_BASE_URL = 'https://open.tiktokapis.com/v2'; // TikTok API endpoint

// Facebook API Key
const FACEBOOK_ACCESS_TOKEN = 'EAAbxH9xGReQBQ5u8Frzo4cb9QOfc88kw9Yagf0nmS4wY28VAXcl6IK6kPMmUStgjZBjEm20jGJ7X2viqcq7ySShIlhqdR3fq67gS8wfVyOQZB9StyC2aLNV4ZAZB82sbwIncFbjNDiTZBN2ulc2FhpGGwoYlrpj4g2wVmGbSZCq6YKZA5TVbbi6cyM1W7r58Prd1x4GAm52r52ziSZCFwK9wYdRBqFWTstImXgZDZD';

// YouTube API Key
const YOUTUBE_API_KEY = ''; // Will be provided by the user

// LinkedIn API Key
const LINKEDIN_ACCESS_TOKEN = ''; // Will be provided by the user

// TikTok API Key
const TIKTOK_CLIENT_KEY = ''; // Will be provided by the user
const TIKTOK_CLIENT_SECRET = ''; // Will be provided by the user
const TIKTOK_ACCESS_TOKEN = ''; // Will be provided by the user

// API Service for handling all API calls
class SocialMediaAPI {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.youtubeBaseUrl = YOUTUBE_API_BASE_URL;
    this.linkedinBaseUrl = LINKEDIN_API_BASE_URL;
    this.tiktokBaseUrl = TIKTOK_API_BASE_URL;
    this.token = localStorage.getItem('authToken') || null;
    this.facebookToken = FACEBOOK_ACCESS_TOKEN;
    this.youtubeApiKey = YOUTUBE_API_KEY;
    this.linkedinAccessToken = LINKEDIN_ACCESS_TOKEN;
    this.tiktokClientKey = TIKTOK_CLIENT_KEY;
    this.tiktokClientSecret = TIKTOK_CLIENT_SECRET;
    this.tiktokAccessToken = TIKTOK_ACCESS_TOKEN;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Helper method for making API requests
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(identifier, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    const response = await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
    return response;
  }

  // Social media platform connection methods
  async connectFacebook(pageId, accessToken) {
    try {
      // Using Facebook Graph API to get page access token
      const response = await fetch(`${this.baseUrl}/me/accounts?access_token=${accessToken || this.facebookToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      // Find the requested page
      const page = data.data.find(p => p.id === pageId);
      if (!page) {
        throw new Error('Page not found');
      }
      
      return {
        success: true,
        pageId: page.id,
        pageName: page.name,
        accessToken: page.access_token
      };
    } catch (error) {
      console.error('Facebook connection error:', error);
      throw error;
    }
  }
  
  // Post to Facebook
  async postToFacebook(pageId, message, accessToken) {
    try {
      const response = await fetch(`${this.baseUrl}/${pageId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          access_token: accessToken || this.facebookToken
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        postId: data.id
      };
    } catch (error) {
      console.error('Facebook post error:', error);
      throw error;
    }
  }
  
  // Post photo to Facebook
  async postPhotoToFacebook(pageId, photoUrl, message, accessToken) {
    try {
      const response = await fetch(`${this.baseUrl}/${pageId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: photoUrl,
          caption: message,
          access_token: accessToken || this.facebookToken
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        postId: data.id
      };
    } catch (error) {
      console.error('Facebook photo post error:', error);
      throw error;
    }
  }
  
  // Post video to Facebook
  async postVideoToFacebook(pageId, videoUrl, message, accessToken) {
    try {
      const response = await fetch(`${this.baseUrl}/${pageId}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_url: videoUrl,
          description: message,
          access_token: accessToken || this.facebookToken
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        postId: data.id
      };
    } catch (error) {
      console.error('Facebook video post error:', error);
      throw error;
    }
  }
  
  // Get Facebook pages
  async getFacebookPages(accessToken) {
    try {
      const response = await fetch(`${this.baseUrl}/me/accounts?access_token=${accessToken || this.facebookToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        pages: data.data
      };
    } catch (error) {
      console.error('Get Facebook pages error:', error);
      throw error;
    }
  }
  
  // Get Facebook page info
  async getFacebookPageInfo(pageId, accessToken) {
    try {
      const response = await fetch(`${this.baseUrl}/${pageId}?fields=id,name,picture,fan_count&access_token=${accessToken || this.facebookToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        page: data
      };
    } catch (error) {
      console.error('Get Facebook page info error:', error);
      throw error;
    }
  }
  
  // Get Facebook posts
  async getFacebookPosts(pageId, accessToken, limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/${pageId}/posts?limit=${limit}&fields=id,message,created_time,permalink_url&access_token=${accessToken || this.facebookToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        posts: data.data
      };
    } catch (error) {
      console.error('Get Facebook posts error:', error);
      throw error;
    }
  }
  
  // Instagram API methods
  
  // Connect Instagram account
  async connectInstagram(userId, accessToken) {
    try {
      // Get Instagram business account linked to Facebook page
      const response = await fetch(`${this.baseUrl}/${userId}?fields=instagram_business_account&access_token=${accessToken || this.facebookToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      if (!data.instagram_business_account) {
        throw new Error('No Instagram business account found');
      }
      
      return {
        success: true,
        instagramId: data.instagram_business_account.id,
        instagramUsername: data.instagram_business_account.username
      };
    } catch (error) {
      console.error('Instagram connection error:', error);
      throw error;
    }
  }
  
  // Get Instagram media
  async getInstagramMedia(instagramId, accessToken, limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/${instagramId}/media?limit=${limit}&fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${accessToken || this.facebookToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        media: data.data
      };
    } catch (error) {
      console.error('Get Instagram media error:', error);
      throw error;
    }
  }
  
  // Post image to Instagram
  async postImageToInstagram(instagramId, imageUrl, caption, accessToken) {
    try {
      // Step 1: Create a container
      const containerResponse = await fetch(`${this.baseUrl}/${instagramId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken || this.facebookToken
        })
      });
      
      const containerData = await containerResponse.json();
      
      if (containerData.error) {
        throw new Error(containerData.error.message);
      }
      
      // Step 2: Publish the container
      const publishResponse = await fetch(`${this.baseUrl}/${instagramId}/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken || this.facebookToken
        })
      });
      
      const publishData = await publishResponse.json();
      
      if (publishData.error) {
        throw new Error(publishData.error.message);
      }
      
      return {
        success: true,
        mediaId: publishData.id
      };
    } catch (error) {
      console.error('Instagram image post error:', error);
      throw error;
    }
  }
  
  // Post video to Instagram
  async postVideoToInstagram(instagramId, videoUrl, caption, accessToken) {
    try {
      // Step 1: Create a container
      const containerResponse = await fetch(`${this.baseUrl}/${instagramId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: videoUrl,
          caption: caption,
          media_type: 'VIDEO',
          access_token: accessToken || this.facebookToken
        })
      });
      
      const containerData = await containerResponse.json();
      
      if (containerData.error) {
        throw new Error(containerData.error.message);
      }
      
      // Step 2: Check status of the container (video processing takes time)
      let status = 'IN_PROGRESS';
      let attempts = 0;
      const maxAttempts = 20;
      
      while (status === 'IN_PROGRESS' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        
        const statusResponse = await fetch(`${this.baseUrl}/${containerData.id}?fields=status_code&access_token=${accessToken || this.facebookToken}`);
        const statusData = await statusResponse.json();
        
        if (statusData.error) {
          throw new Error(statusData.error.message);
        }
        
        status = statusData.status_code;
        attempts++;
      }
      
      if (status !== 'FINISHED') {
        throw new Error('Video processing failed or timed out');
      }
      
      // Step 3: Publish the container
      const publishResponse = await fetch(`${this.baseUrl}/${instagramId}/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken || this.facebookToken
        })
      });
      
      const publishData = await publishResponse.json();
      
      if (publishData.error) {
        throw new Error(publishData.error.message);
      }
      
      return {
        success: true,
        mediaId: publishData.id
      };
    } catch (error) {
      console.error('Instagram video post error:', error);
      throw error;
    }
  }
  
  // Get Instagram user info
  async getInstagramUserInfo(instagramId, accessToken) {
    try {
      const response = await fetch(`${this.baseUrl}/${instagramId}?fields=id,username,account_type,media_count,followers_count&access_token=${accessToken || this.facebookToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        user: data
      };
    } catch (error) {
      console.error('Get Instagram user info error:', error);
      throw error;
    }
  }
  
  // YouTube API methods
  
  // Connect YouTube account
  async connectYouTube(accessToken) {
    try {
      const response = await fetch(`${this.youtubeBaseUrl}/channels?part=snippet,contentDetails,statistics&mine=true&access_token=${accessToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      if (!data.items || data.items.length === 0) {
        throw new Error('No YouTube channel found');
      }
      
      const channel = data.items[0];
      
      return {
        success: true,
        channelId: channel.id,
        channelTitle: channel.snippet.title,
        channelDescription: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails.default.url,
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount
      };
    } catch (error) {
      console.error('YouTube connection error:', error);
      throw error;
    }
  }
  
  // Upload video to YouTube
  async uploadVideoToYouTube(channelId, videoData, accessToken) {
    try {
      const videoResource = {
        snippet: {
          title: videoData.title,
          description: videoData.description,
          tags: videoData.tags || [],
          categoryId: videoData.categoryId || '22'
        },
        status: {
          privacyStatus: videoData.privacyStatus || 'public',
          selfDeclaredMadeForKids: videoData.madeForKids || false
        }
      };
      
      const formData = new FormData();
      formData.append('video', videoData.file);
      formData.append('metadata', JSON.stringify(videoResource));
      
      const response = await fetch(`${this.youtubeBaseUrl}/videos?uploadType=resumable&part=snippet,status&access_token=${accessToken}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoResource)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message);
      }
      
      const uploadUrl = response.headers.get('Location');
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'video/*'
        },
        body: videoData.file
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error.message);
      }
      
      const uploadData = await uploadResponse.json();
      
      return {
        success: true,
        videoId: uploadData.id
      };
    } catch (error) {
      console.error('YouTube video upload error:', error);
      throw error;
    }
  }
  
  // Get YouTube videos
  async getYouTubeVideos(channelId, accessToken, maxResults = 10) {
    try {
      const response = await fetch(`${this.youtubeBaseUrl}/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=${maxResults}&access_token=${accessToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        videos: data.items
      };
    } catch (error) {
      console.error('Get YouTube videos error:', error);
      throw error;
    }
  }
  
  // Get YouTube channel info
  async getYouTubeChannelInfo(channelId, accessToken) {
    try {
      const response = await fetch(`${this.youtubeBaseUrl}/channels?part=snippet,contentDetails,statistics&id=${channelId}&access_token=${accessToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      if (!data.items || data.items.length === 0) {
        throw new Error('Channel not found');
      }
      
      const channel = data.items[0];
      
      return {
        success: true,
        channel: {
          id: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnail: channel.snippet.thumbnails.default.url,
          subscriberCount: channel.statistics.subscriberCount,
          videoCount: channel.statistics.videoCount,
          viewCount: channel.statistics.viewCount
        }
      };
    } catch (error) {
      console.error('Get YouTube channel info error:', error);
      throw error;
    }
  }
  
  // LinkedIn API methods
  
  // Connect LinkedIn account
  async connectLinkedIn(accessToken) {
    try {
      // Get user profile
      const response = await fetch(`${this.linkedinBaseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken || this.linkedinAccessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        userId: data.id,
        firstName: data.localizedFirstName,
        lastName: data.localizedLastName
      };
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      throw error;
    }
  }
  
  // Post to LinkedIn
  async postToLinkedIn(userId, message, accessToken) {
    try {
      // Register the share
      const registerResponse = await fetch(`${this.linkedinBaseUrl}/ugcPosts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken || this.linkedinAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          author: `urn:li:person:${userId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: message
              },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        })
      });
      
      const data = await registerResponse.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        postId: data.id
      };
    } catch (error) {
      console.error('LinkedIn post error:', error);
      throw error;
    }
  }
  
  // Post image to LinkedIn
  async postImageToLinkedIn(userId, imageUrl, message, accessToken) {
    try {
      // Register the image upload
      const registerResponse = await fetch(`${this.linkedinBaseUrl}/assets?action=registerUpload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken || this.linkedinAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaAsset:genericimage'],
            owner: `urn:li:person:${userId}`,
            serviceRelationships: [
              {
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
              }
            ]
          }
        })
      });
      
      const registerData = await registerResponse.json();
      
      if (registerData.error) {
        throw new Error(registerData.error.message);
      }
      
      // Upload the image
      const uploadResponse = await fetch(registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadRequest'].uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken || this.linkedinAccessToken}`,
          'Content-Type': 'application/octet-stream'
        },
        body: imageUrl // In a real implementation, this would be the actual image data
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Image upload failed');
      }
      
      // Create the post with the image
      const postResponse = await fetch(`${this.linkedinBaseUrl}/ugcPosts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken || this.linkedinAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          author: `urn:li:person:${userId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: message
              },
              shareMediaCategory: 'IMAGE',
              media: [
                {
                  status: 'READY',
                  description: {
                    text: message
                  },
                  media: `urn:li:digitalmediaAsset:${registerData.value.asset}`,
                  title: {
                    text: 'Image Post'
                  }
                }
              ]
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        })
      });
      
      const postData = await postResponse.json();
      
      if (postData.error) {
        throw new Error(postData.error.message);
      }
      
      return {
        success: true,
        postId: postData.id
      };
    } catch (error) {
      console.error('LinkedIn image post error:', error);
      throw error;
    }
  }
  
  // Get LinkedIn posts
  async getLinkedInPosts(userId, accessToken) {
    try {
      const response = await fetch(`${this.linkedinBaseUrl}/ugcPosts?q=authors&authors=List(urn%3Ali%3Aperson%3A${userId})`, {
        headers: {
          'Authorization': `Bearer ${accessToken || this.linkedinAccessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        posts: data.elements
      };
    } catch (error) {
      console.error('Get LinkedIn posts error:', error);
      throw error;
    }
  }
  
  // TikTok API methods
  
  // Connect TikTok account
  async connectTikTok(accessToken) {
    try {
      // Get user info
      const response = await fetch(`${this.tiktokBaseUrl}/user/info/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken || this.tiktokAccessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        userId: data.data.user.open_id,
        username: data.data.user.display_name,
        avatarUrl: data.data.user.avatar_url
      };
    } catch (error) {
      console.error('TikTok connection error:', error);
      throw error;
    }
  }
  
  // Post video to TikTok
  async postVideoToTikTok(videoData, accessToken) {
    try {
      // Step 1: Initialize video upload
      const initResponse = await fetch(`${this.tiktokBaseUrl}/video/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken || this.tiktokAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video: {
            video_size: videoData.size,
            video_caption: videoData.caption
          }
        })
      });
      
      const initData = await initResponse.json();
      
      if (initData.error) {
        throw new Error(initData.error.message);
      }
      
      const { publish_id, upload_url } = initData.data;
      
      // Step 2: Upload the video file
      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4'
        },
        body: videoData.file
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Video upload failed');
      }
      
      // Step 3: Publish the video
      const publishResponse = await fetch(`${this.tiktokBaseUrl}/video/publish/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken || this.tiktokAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          publish_id: publish_id
        })
      });
      
      const publishData = await publishResponse.json();
      
      if (publishData.error) {
        throw new Error(publishData.error.message);
      }
      
      return {
        success: true,
        videoId: publishData.data.video_id
      };
    } catch (error) {
      console.error('TikTok video post error:', error);
      throw error;
    }
  }
  
  // Get TikTok videos
  async getTikTokVideos(userId, accessToken, maxResults = 10) {
    try {
      const response = await fetch(`${this.tiktokBaseUrl}/video/list/?open_id=${userId}&max_count=${maxResults}`, {
        headers: {
          'Authorization': `Bearer ${accessToken || this.tiktokAccessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        videos: data.data.videos
      };
    } catch (error) {
      console.error('Get TikTok videos error:', error);
      throw error;
    }
  }
  
  // Get TikTok user info
  async getTikTokUserInfo(userId, accessToken) {
    try {
      const response = await fetch(`${this.tiktokBaseUrl}/user/info/?open_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken || this.tiktokAccessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return {
        success: true,
        user: {
          id: data.data.user.open_id,
          username: data.data.user.display_name,
          avatarUrl: data.data.user.avatar_url,
          followerCount: data.data.user.follower_count,
          followingCount: data.data.user.following_count,
          likesCount: data.data.user.likes_count,
          videoCount: data.data.user.video_count
        }
      };
    } catch (error) {
      console.error('Get TikTok user info error:', error);
      throw error;
    }
  }

  async connectYouTube(channelId, apiKey) {
    return this.request('/social/youtube/connect', {
      method: 'POST',
      body: JSON.stringify({ channelId, apiKey }),
    });
  }

  async connectTikTok(username, accessToken) {
    return this.request('/social/tiktok/connect', {
      method: 'POST',
      body: JSON.stringify({ username, accessToken }),
    });
  }

  async connectLinkedIn(profileUrl, accessToken) {
    return this.request('/social/linkedin/connect', {
      method: 'POST',
      body: JSON.stringify({ profileUrl, accessToken }),
    });
  }

  async connectInstagram(username, accessToken) {
    return this.request('/social/instagram/connect', {
      method: 'POST',
      body: JSON.stringify({ username, accessToken }),
    });
  }

  // Post management methods
  async createPost(postData) {
    // Check if Facebook is one of the platforms
    if (postData.platforms && postData.platforms.includes('facebook')) {
      try {
        // Get Facebook page ID from social links
        const socialLinks = await this.getSocialLinks();
        const facebookPageId = socialLinks.facebook;
        
        if (facebookPageId) {
          // Extract text content from HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = postData.content;
          const message = tempDiv.textContent || tempDiv.innerText || '';
          
          // Check post type and files
          if (postData.type === 'media' && postData.files && postData.files.length > 0) {
            // Handle media posts (images/videos)
            for (const file of postData.files) {
              if (file.type.startsWith('image/')) {
                // Post image to Facebook
                await this.postPhotoToFacebook(facebookPageId, file.url, message);
              } else if (file.type.startsWith('video/')) {
                // Post video to Facebook
                await this.postVideoToFacebook(facebookPageId, file.url, message);
              }
            }
          } else {
            // Post text only to Facebook
            await this.postToFacebook(facebookPageId, message);
          }
        }
      } catch (error) {
        console.error('Error posting to Facebook:', error);
        // Continue with other platforms even if Facebook fails
      }
    }
    
    // Check if Instagram is one of the platforms
    if (postData.platforms && postData.platforms.includes('instagram')) {
      try {
        // Get Instagram ID from social links
        const socialLinks = await this.getSocialLinks();
        const instagramId = socialLinks.instagram;
        
        if (instagramId) {
          // Extract text content from HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = postData.content;
          const caption = tempDiv.textContent || tempDiv.innerText || '';
          
          // Check post type and files
          if (postData.type === 'media' && postData.files && postData.files.length > 0) {
            // Handle media posts (images/videos)
            for (const file of postData.files) {
              if (file.type.startsWith('image/')) {
                // Post image to Instagram
                await this.postImageToInstagram(instagramId, file.url, caption);
              } else if (file.type.startsWith('video/')) {
                // Post video to Instagram
                await this.postVideoToInstagram(instagramId, file.url, caption);
              }
            }
          }
          // Note: Instagram doesn't support text-only posts
        }
      } catch (error) {
        console.error('Error posting to Instagram:', error);
        // Continue with other platforms even if Instagram fails
      }
    }
    
    // Check if YouTube is one of the platforms
    if (postData.platforms && postData.platforms.includes('youtube')) {
      try {
        // Get YouTube channel ID from social links
        const socialLinks = await this.getSocialLinks();
        const youtubeChannelId = socialLinks.youtube;
        
        if (youtubeChannelId) {
          // Extract text content from HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = postData.content;
          const description = tempDiv.textContent || tempDiv.innerText || '';
          
          // Check post type and files
          if (postData.type === 'media' && postData.files && postData.files.length > 0) {
            // Handle media posts (videos only for YouTube)
            for (const file of postData.files) {
              if (file.type.startsWith('video/')) {
                // Upload video to YouTube
                await this.uploadVideoToYouTube(youtubeChannelId, {
                  title: postData.title || 'New Video',
                  description: description,
                  file: file,
                  privacyStatus: postData.privacy || 'public',
                  tags: postData.tags || [],
                  categoryId: postData.categoryId || '22'
                });
              }
            }
          }
          // Note: YouTube doesn't support text-only posts
        }
      } catch (error) {
        console.error('Error posting to YouTube:', error);
        // Continue with other platforms even if YouTube fails
      }
    }
    
    // Check if LinkedIn is one of the platforms
    if (postData.platforms && postData.platforms.includes('linkedin')) {
      try {
        // Get LinkedIn user ID from social links
        const socialLinks = await this.getSocialLinks();
        const linkedinUserId = socialLinks.linkedin;
        
        if (linkedinUserId) {
          // Extract text content from HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = postData.content;
          const message = tempDiv.textContent || tempDiv.innerText || '';
          
          // Check post type and files
          if (postData.type === 'media' && postData.files && postData.files.length > 0) {
            // Handle media posts (images only for LinkedIn)
            for (const file of postData.files) {
              if (file.type.startsWith('image/')) {
                // Post image to LinkedIn
                await this.postImageToLinkedIn(linkedinUserId, file.url, message);
              }
            }
          } else {
            // Post text only to LinkedIn
            await this.postToLinkedIn(linkedinUserId, message);
          }
        }
      } catch (error) {
        console.error('Error posting to LinkedIn:', error);
        // Continue with other platforms even if LinkedIn fails
      }
    }
    
    // Check if TikTok is one of the platforms
    if (postData.platforms && postData.platforms.includes('tiktok')) {
      try {
        // Get TikTok user ID from social links
        const socialLinks = await this.getSocialLinks();
        const tiktokUserId = socialLinks.tiktok;
        
        if (tiktokUserId) {
          // Extract text content from HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = postData.content;
          const caption = tempDiv.textContent || tempDiv.innerText || '';
          
          // Check post type and files
          if (postData.type === 'media' && postData.files && postData.files.length > 0) {
            // Handle media posts (videos only for TikTok)
            for (const file of postData.files) {
              if (file.type.startsWith('video/')) {
                // Post video to TikTok
                await this.postVideoToTikTok({
                  file: file,
                  size: file.size,
                  caption: caption
                });
              }
            }
          }
          // Note: TikTok doesn't support text-only posts
        }
      } catch (error) {
        console.error('Error posting to TikTok:', error);
        // Continue with other platforms even if TikTok fails
      }
    }
    
    // For other platforms, you can add similar logic here
    
    // Return success response
    return {
      success: true,
      id: 'p_' + Date.now(),
      ...postData
    };
  }

  async schedulePost(postData, scheduledTime) {
    return this.request('/posts/schedule', {
      method: 'POST',
      body: JSON.stringify({ ...postData, scheduledTime }),
    });
  }

  async getPosts(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/posts?${queryParams}`);
  }

  async deletePost(postId) {
    return this.request(`/posts/${postId}`, { method: 'DELETE' });
  }

  async saveDraft(postData) {
    return this.request('/posts/draft', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  // User profile methods
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async saveSocialLinks(socialLinks) {
    return this.request('/user/social-links', {
      method: 'POST',
      body: JSON.stringify(socialLinks),
    });
  }

  async getSocialLinks() {
    return this.request('/user/social-links');
  }
}

// Initialize API instance
const api = new SocialMediaAPI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
