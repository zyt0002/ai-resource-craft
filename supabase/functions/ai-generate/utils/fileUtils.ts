
// 检查文件是否为图片
export function isImageFile(contentType: string, fileName: string): boolean {
  if (contentType.includes('image/')) return true;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}

// 检查文件是否为文本文件
export function isTextFile(contentType: string, fileName: string): boolean {
  if (contentType.includes('text/')) return true;
  if (contentType.includes('application/json')) return true;
  if (contentType.includes('application/xml')) return true;
  
  const textExtensions = ['.txt', '.md', '.markdown', '.json', '.xml', '.csv', '.log', '.yml', '.yaml', '.ini', '.cfg', '.conf'];
  return textExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}

// 将图片转换为base64
export async function imageToBase64(fileUrl: string): Promise<string | null> {
  try {
    console.log('开始获取图片:', fileUrl);
    const response = await fetch(fileUrl);
    if (!response.ok) {
      console.error('获取图片失败:', response.status, response.statusText);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('图片大小:', arrayBuffer.byteLength, 'bytes');
    
    // 转换为base64
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64}`;
    
    console.log('图片base64转换成功，数据URL长度:', dataUrl.length);
    return dataUrl;
  } catch (error) {
    console.error('图片转换base64失败:', error);
    return null;
  }
}

// 从URL获取文件内容
export async function getFileContent(fileUrl: string): Promise<string> {
  try {
    console.log('正在获取文件内容:', fileUrl);
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`获取文件失败: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    console.log('文件类型:', contentType);
    
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1] || '';
    console.log('文件名:', fileName);
    
    if (isTextFile(contentType, fileName)) {
      const textContent = await response.text();
      console.log('成功读取文本文件，内容长度:', textContent.length);
      return textContent;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const fileSize = arrayBuffer.byteLength;
    
    console.log('文件大小:', fileSize, 'bytes');
    
    if (contentType.includes('application/pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      return `检测到PDF文件（${fileSize}字节），但当前系统无法直接解析PDF内容。建议：
1. 将PDF内容复制粘贴到输入框中
2. 或者描述PDF的主要内容，我可以根据你的描述生成相关资料
3. 如果是文字较少的PDF，可以截图上传`;
    } else if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || 
               contentType.includes('application/msword') ||
               fileName.toLowerCase().endsWith('.docx') ||
               fileName.toLowerCase().endsWith('.doc')) {
      return `检测到Word文档（${fileSize}字节），但当前系统无法直接解析Word文档内容。建议：
1. 打开Word文档，复制文字内容并粘贴到输入框中
2. 或者告诉我文档的主题和要点，我可以据此生成相关教学资料
3. 如果文档包含重要图表，可以截图上传`;
    } else if (isImageFile(contentType, fileName)) {
      return `这是一个图片文件（${fileSize}字节）。如果选择了支持视觉的多模态模型（如Qwen2.5-VL），可以直接分析图片内容。`;
    } else {
      return `检测到${contentType || '未知'}类型文件（${fileSize}字节）。当前系统暂不支持直接解析此类文件。建议：
1. 如果是文本内容，请复制粘贴到输入框中
2. 或者描述文件的主要内容，我可以根据描述生成相关资料`;
    }
    
  } catch (error) {
    console.error('获取文件内容失败:', error);
    return `文件访问失败：${error.message}。请确认：
1. 文件链接是否有效
2. 文件是否可以正常访问
3. 或者将文件内容直接复制粘贴到输入框中`;
  }
}
