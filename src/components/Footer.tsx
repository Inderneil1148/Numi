import React from 'react';

const PRODUCT_HUNT_EMBED_HTML = `<div style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif; border: 1px solid rgb(224, 224, 224); border-radius: 12px; padding: 20px; max-width: 500px; background: rgb(255, 255, 255); box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 8px; margin: 0 auto; text-align: left;"><div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;"><img alt="Numi" src="https://ph-files.imgix.net/845ac556-d705-475d-9b1d-149743844cb8.svg?auto=compress,format&amp;codec=mozjpeg&amp;cs=strip&amp;fit=crop&amp;h=80&amp;w=80" style="width: 64px; height: 64px; border-radius: 8px; object-fit: cover; flex-shrink: 0;"><div style="flex: 1 1 0%; min-width: 0px;"><h3 style="margin: 0px; font-size: 18px; font-weight: 600; color: rgb(26, 26, 26); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Numi</h3><p style="margin: 4px 0px 0px; font-size: 14px; color: rgb(102, 102, 102); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">Minimal expense tracker</p></div></div><a href="https://www.producthunt.com/products/numi-4?embed=true&amp;utm_source=embed&amp;utm_medium=post_embed" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 4px; margin-top: 12px; padding: 8px 16px; background: rgb(255, 97, 84); color: rgb(255, 255, 255); text-decoration: none; border-radius: 9999px; font-size: 16px; font-weight: 600; line-height: 1.5;">Check it out on Product Hunt →</a></div>`;

interface FooterProps {
  onReplaySplash?: () => void;
  onOpenSettings?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onReplaySplash, onOpenSettings }) => {
  return (
    <footer className="w-full pt-8 pb-10 px-4 sm:px-6 mt-auto">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        {/* Subtle Section Label */}
        <div className="flex items-center gap-2 mb-3.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6154]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] dark:text-[#8E8E93]">
            Community & Launch
          </span>
        </div>

        {/* Product Hunt Embed Card */}
        <div className="w-full max-w-[500px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)] rounded-2xl transition-transform hover:-translate-y-0.5 duration-200">
          <div
            dangerouslySetInnerHTML={{ __html: PRODUCT_HUNT_EMBED_HTML }}
            className="w-full"
          />
        </div>

        {/* Sub-footer details and brand stamp */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#86868B] dark:text-[#8E8E93]">
          <span className="font-semibold text-[#1D1D1F] dark:text-white">
            Numi v2.0.0
          </span>
          <span className="text-[#D1D1D6] dark:text-[#38383A]">•</span>
          <span>Minimal expense tracker</span>
          <span className="text-[#D1D1D6] dark:text-[#38383A]">•</span>
          {onReplaySplash && (
            <button
              type="button"
              onClick={onReplaySplash}
              className="text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer active:scale-95 transition-transform"
            >
              Replay Intro
            </button>
          )}
          {onOpenSettings && (
            <>
              <span className="text-[#D1D1D6] dark:text-[#38383A]">•</span>
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-[#86868B] dark:text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white transition-colors cursor-pointer"
              >
                Settings
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};
