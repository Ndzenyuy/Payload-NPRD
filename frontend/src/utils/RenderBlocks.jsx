import React from 'react'
import { blocks } from '@/blocks/blocklist';

export const  RenderBlocks = ({layout}) => {
    if (!layout || !Array.isArray(layout)) {
      return null;
    }

    return (
      <div>
        {layout.map((block, i) => {
          if (!block || !block.blockType) {
            return null;
          }
          const Block = blocks[block.blockType];
          if (Block) {
            return <Block key={i} {...block} />;
          }
          return null;
        })}
      </div>
    );
}
