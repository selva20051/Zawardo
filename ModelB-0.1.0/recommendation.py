from googleapiclient.discovery import build

API_KEY = 'API_KEY'

def fetch_youtube_videos(query, max_results=5):
    youtube = build('youtube', 'v3', developerKey=API_KEY)
    
    request = youtube.search().list(
        q=query,
        part='snippet',
        type='video',
        maxResults=max_results
    )
    response = request.execute()
   
    videos = []
    for item in response.get('items', []):
        video_title = item['snippet']['title']
        video_url = f"https://www.youtube.com/watch?v={item['id']['videoId']}"
        # Get thumbnail URL - using medium quality
        thumbnail_url = item['snippet']['thumbnails']['medium']['url']
        videos.append({
            'title': video_title, 
            'url': video_url,
            'thumbnail': thumbnail_url
        })
    
    return videos

topic = "Loli selling ice-cream"  
videos = fetch_youtube_videos(topic)

print("Recommended Videos:")
for idx, video in enumerate(videos, start=1):
    print(f"{idx}. {video['title']}")
    print(f"   URL: {video['url']}")
    print(f"   Thumbnail: {video['thumbnail']}\n")
