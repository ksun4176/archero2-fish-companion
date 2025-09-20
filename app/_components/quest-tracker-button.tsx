'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import Image from 'next/image';
import QuestTrackerContent from './quest-tracker-content';
import { basePath } from '../_utils/utils';

type QuestTrackerButtonProps = {
  className?: string;
};
export default function QuestTrackerButton({
  className,
}: QuestTrackerButtonProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={`flex items-center ${className}`}
          aria-label={`Open Task List`}
        >
          <Image
            src={`${basePath}/Icon_TaskCenter.png`}
            alt='Icon Task Center'
            width={150}
            height={150}
            unoptimized
            className='size-6 border-0'
          />
          Quests
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Quest Tracker</DrawerTitle>
        </DrawerHeader>
        <div className='p-4 overflow-auto'>
          <QuestTrackerContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
