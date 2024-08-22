// assets.js

// Function to fetch repository contents
async function fetchRepositoryContents(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const linkHeader = response.headers.get("link");
    if (linkHeader) {
      const nextPageUrl = linkHeader.match(/<([^>]+)>; rel="next"/)[1];
      const nextPageData = await fetchRepositoryContents(nextPageUrl);
      data.push(...nextPageData);
    }
    return data;
  } catch (error) {
    console.error("Failed to fetch repository contents:", error);
    return null;
  }
}

// Function to get all image files from the repository
async function getImageFiles(data) {
  const imageFiles = [];
  for (const item of data) {
    if (item.type === "file" && isImage(item.name)) {
      imageFiles.push(
        `https://api.github.com/repos/Mosberg/assets/contents/images/${item.path}`
      );
    } else if (item.type === "dir") {
      // Recursively fetch subdirectory contents
      const subdirectoryUrl = `https://api.github.com/repos/Mosberg/assets/contents/${item.path}`;
      const subdirectoryData = await fetchRepositoryContents(subdirectoryUrl);
      if (subdirectoryData) {
        const subdirectoryImages = await getImageFiles(subdirectoryData);
        imageFiles.push(...subdirectoryImages);
      }
    }
  }
  return imageFiles;
}

// Function to check if a file is an image
function isImage(filename) {
  const imageExtensions = [".webp", ".ico"];
  return imageExtensions.some((extension) =>
    filename.toLowerCase().endsWith(extension)
  );
}

// Function to load images into the HTML
function loadImages(imageUrls) {
  const mainElement = document.querySelector("main.loadContent");
  imageUrls.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    mainElement.appendChild(img);
  });
}

// Main execution
async function main() {
  const url = "https://api.github.com/repos/Mosberg/assets/contents/";
  const data = await fetchRepositoryContents(url);
  if (data) {
    const imageFiles = await getImageFiles(data);
    loadImages(imageFiles);
  }
}

main();
