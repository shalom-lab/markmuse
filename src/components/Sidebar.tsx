import { useState } from 'react';
import Logo from './Logo';
import { WeChatOfficialAccountIcon } from './icons';
import { convertToWeChatHTML, copyToClipboard } from '../utils/wechatExport';
import { convertToWeChatHTMLHeadless } from '../utils/wechatExportHeadless';
import { Toast } from './Toast';

interface Props {
  getPreviewElement: () => HTMLElement | null;
  customCss: string;
  getMarkdownContent: () => string;
}

export default function Sidebar({ 
  getPreviewElement,
  customCss,
  getMarkdownContent
}: Props) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleWeChatCopy = async () => {
    try {
      // 在点击时获取最新的预览元素
      const previewElement = getPreviewElement();
      
      if (!previewElement) {
        setToastMessage('预览区域未加载，请稍后再试');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
      
      //console.log('预览元素:', previewElement);
      //console.log('预览内容:', previewElement.innerHTML);
      //console.log('CSS内容:', customCss);
      
      const wechatHTML = await convertToWeChatHTML(previewElement, customCss);
      
      if (!wechatHTML || wechatHTML.trim() === '') {
        setToastMessage('内容为空，请先编辑内容');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
      
      // 从 HTML 中提取纯文本（用于 text/plain 格式）
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = wechatHTML;
      const plainText = tempDiv.innerText || tempDiv.textContent || '';
      
      // 获取原始 markdown（用于 text/markdown 格式）
      const markdown = getMarkdownContent();
      
      const success = await copyToClipboard(wechatHTML, plainText, markdown);
      
      if (success) {
        setToastMessage('已复制，可粘贴到公众号编辑器');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setToastMessage('复制失败，请重试');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('转换失败:', error);
      setToastMessage('转换失败，请重试');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleWeChatCopyHeadless = async () => {
    try {
      const markdown = getMarkdownContent();
      
      if (!markdown || markdown.trim() === '') {
        setToastMessage('内容为空，请先编辑内容');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
      
      const wechatHTML = await convertToWeChatHTMLHeadless(markdown, customCss);
      
      if (!wechatHTML || wechatHTML.trim() === '') {
        setToastMessage('转换结果为空，请重试');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
      
      // 从 HTML 中提取纯文本（用于 text/plain 格式）
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = wechatHTML;
      const plainText = tempDiv.innerText || tempDiv.textContent || '';
      
      // 使用原始 markdown（用于 text/markdown 格式）
      const success = await copyToClipboard(wechatHTML, plainText, markdown);
      
      if (success) {
        setToastMessage('已复制，可粘贴到公众号编辑器');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setToastMessage('复制失败，请重试');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('转换失败:', error);
      setToastMessage('转换失败，请重试');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleMarkMuseClick = () => {
    window.open('https://github.com/shalom-lab/markmuse', '_blank', 'noopener,noreferrer');
  };

  const tools = [
    { 
      id: 'markmuse',
      icon: <Logo />, 
      label: 'MarkMuse',
      className: 'mb-6', // 为 logo 添加额外的下边距
      onClick: handleMarkMuseClick
    },
    // { icon: '↻', label: '同步' },
    { 
      id: 'wechat',
      icon: <WeChatOfficialAccountIcon className="w-5 h-5" />, 
      label: '公众号',
      onClick: handleWeChatCopy
    },
    { 
      id: 'wechat-headless',
      icon: <WeChatOfficialAccountIcon className="w-5 h-5" />, 
      label: '公众号',
      onClick: handleWeChatCopyHeadless
    },
    // { icon: '知', label: '知乎' },
    // { icon: '∧', label: '导出' },
    // { icon: '⇆', label: '切换' },
    // { icon: '📱', label: '移动端' }
  ];

  return (
    <>
      <div className="fixed right-0 top-0 bottom-0 w-12 border-l border-gray-200 bg-white flex flex-col items-center py-4 z-50">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={tool.onClick}
            className={`w-8 h-8 flex items-center justify-center rounded transition-colors
              ${tool.className || 'mb-6'} 
              text-gray-600 hover:bg-gray-100`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      <Toast 
        message={toastMessage} 
        type={toastMessage.includes('已复制') ? 'success' : toastMessage.includes('失败') ? 'error' : 'info'}
        isOpen={showToast}
        onClose={() => setShowToast(false)} 
      />
    </>
  );
} 