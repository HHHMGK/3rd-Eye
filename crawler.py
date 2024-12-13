import requests
from bs4 import BeautifulSoup
from PIL import Image

def find_main_content_block(current_tag, logger = None):
    num_p_tags = 0
    child_max_p_count = 0
    child_max_p_tag = None
    for tag in current_tag.children:
        if tag.name is None or tag.name in ['header','footer']:
            continue
        if tag.name == 'p':
            num_p_tags += 1
        else:
            max_p_tag, max_p_count = find_main_content_block(tag)
            if max_p_count > child_max_p_count:
                child_max_p_count = max_p_count
                child_max_p_tag = max_p_tag
    if num_p_tags > child_max_p_count:
        return current_tag, num_p_tags
    else:
        return child_max_p_tag, child_max_p_count


def crawl_article(url, logger = None):
    # Fetch the page content
    response = requests.get(url)
    if response.status_code == 200:
        if logger is not None:
            logger.info(f"Page retrieved successfully, URL: {url}")
        page_content = response.content
    else:
        if logger is not None:
            logger.error(f"Failed to retrieve page: {url}")
        return None

    # Parse the content
    soup = BeautifulSoup(page_content, "html.parser")
    main_content, _ = find_main_content_block(soup)

    # Extract Content
    content_paragraphs = main_content.find_all("p")
    if content_paragraphs is not None:
        content = "\n".join([p.get_text(strip=True) for p in content_paragraphs])
    else:
        # print("Content not found")
        if logger is not None:
            logger.error("Content not found")
        content_paragraphs = ""
        content = ""

    # Extract Images
    images = main_content.find_all("img")
    img_urls = []
    for img in images:
        if img.get('data-src') is not None:
            img_urls.append(img.get('data-src'))
        else:
            img_urls.append(img.get('src'))
    img_files = []
    for img_url in img_urls:
        img_file = crawl_image(img_url, logger)
        if img_file is not None:
            img_files.append(img_file)

    res = {
        'text': content,
        'img': img_files,
        'img_urls': img_urls
    }    
    return res

def crawl_image(image_url, logger = None):
    response = requests.get(image_url, stream=True)
    if response.status_code == 200:
        if logger is not None:
            logger.info(f"Image retrieved successfully, URL: {image_url}")
        else :
            print(f"Image retrieved successfully, URL: {image_url}")
        return Image.open(response.raw)
    else:
        if logger is not None:
            logger.error(f"Failed to retrieve image: {image_url}")
        else:
            print(f"Failed to retrieve image: {image_url}")
        return None


# Test the function
if __name__ == '__main__':
    # url = "https://vnexpress.net/chinh-phu-giam-9-dau-moi-to-chuc-cac-bo-da-nganh-da-linh-vuc-4823534.html"
    # url = 'https://dantri.com.vn/xa-hoi/tong-bi-thu-lan-dau-tien-trung-uong-ky-luat-canh-cao-lanh-dao-chu-chot-20241203093055405.htm'
    # url = 'https://e.vnexpress.net/news/sports/football/indonesian-newspaper-says-asean-cup-match-schedule-favors-vietnam-4827064.html'
    url = 'https://dtinews.dantri.com.vn/in-depth/k-pop-carols-free-food-at-south-korea-impeachment-protests-20241212194544637.htm'
    cc = crawl_article(url)
    print(cc['img'])