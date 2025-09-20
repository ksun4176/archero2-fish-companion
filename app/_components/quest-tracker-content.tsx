'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { CheckCircle, Circle, LineSquiggle } from 'lucide-react';
import {
  ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Quest, QuestName, Quests } from '../_utils/utils';
import { Input } from '@/components/ui/input';
import { Progress } from '@radix-ui/react-progress';

type TaskProgressProps = {
  quest: Quest;
  progress: number;
  onProgressChange: (name: QuestName, progress: number) => void;
};
const QuestTracker = memo(function QuestTracker({
  quest,
  progress,
  onProgressChange,
}: TaskProgressProps) {
  const numBreakpoints = quest.breakpoints[0].length;

  const { numBreakpointsMet, completionPercent, remainingDice } =
    useMemo(() => {
      const idx = quest.breakpoints[0].findIndex((bp) =>
        progress == null || isNaN(progress) ? true : bp > progress
      );
      const numBreakpointsMet = idx === -1 ? numBreakpoints : idx;
      const completionPercent =
        numBreakpoints === 0 ? 0 : (numBreakpointsMet / numBreakpoints) * 100;
      const remainingDice = quest.breakpoints[1]
        .slice(numBreakpointsMet)
        .reduce((a, b) => a + b, 0);
      return { numBreakpointsMet, completionPercent, remainingDice };
    }, [progress, numBreakpoints, quest.breakpoints]);

  const updateProgress = (e: ChangeEvent<HTMLInputElement>) => {
    onProgressChange(quest.name, parseInt(e.target.value));
  };

  return (
    <Card>
      <CardHeader className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>{quest.name}</h2>
        <div className='text-md flex items-center gap-1'>
          <span>Remaining</span>
          <LineSquiggle />
          <span>{remainingDice}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex items-center gap-2'>
          <Input
            name={`${quest.name}-input`}
            type='number'
            placeholder={quest.placeholderText}
            value={!progress ? '' : `${progress}`}
            onChange={updateProgress}
            step={1}
            min={0}
            className='flex-1'
          />
          <Progress
            value={completionPercent}
            className='flex-3 h-5 rounded-md [&>div]:bg-success'
          />
        </div>
      </CardContent>
      <CardFooter>
        <div className='flex flex-wrap items-center gap-2'>
          {Array.from({ length: numBreakpoints }, (_, index) => {
            const isCompleted = numBreakpointsMet > index;
            const target = quest.breakpoints[0][index];
            const reward = quest.breakpoints[1][index];
            return (
              <div
                key={index}
                className={`flex items-center gap-1 px-2 py-1 bg-accent rounded transition-all ${
                  isCompleted && 'bg-success/10 text-success'
                }`}
              >
                {isCompleted ? <CheckCircle size={14} /> : <Circle size={14} />}
                <span className='font-medium'>{target}</span>
                <span className='text-xs font-bold text-success'>
                  +{reward}L
                </span>
              </div>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  );
});

type QuestProgress = Record<QuestName, number>;
type StoredState = { questProgress: QuestProgress };
const getBlankProgress = () => {
  return Object.fromEntries(
    Object.values(QuestName).map((questName) => [questName, NaN])
  ) as QuestProgress;
};
export default function QuestTrackerContent() {
  const [questProgress, setQuestProgress] =
    useState<QuestProgress>(getBlankProgress);
  useEffect(() => {
    const saved = localStorage.getItem('questProgress');
    if (saved) {
      try {
        const data = JSON.parse(saved) as StoredState;
        if (data.questProgress) {
          setQuestProgress(data.questProgress);
        }
      } catch {
        console.warn('Failed to load quest progress saved state');
      }
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      const state: StoredState = { questProgress };
      localStorage.setItem('questProgress', JSON.stringify(state));
    }, 300);
    return () => clearTimeout(id);
  }, [questProgress]);

  const onProgressChange = useCallback((name: QuestName, completed: number) => {
    setQuestProgress((prev) => ({
      ...prev,
      [name]: completed,
    }));
  }, []);

  const clearQuests = useCallback(() => {
    setQuestProgress(getBlankProgress);
  }, []);

  const { numEarned, numRemaining } = useMemo(() => {
    let numEarned = 0;
    let numRemaining = 0;
    Quests.forEach((quest) => {
      const numBreakpoints = quest.breakpoints[0].length;
      const progress = questProgress[quest.name];
      let numBreakpointsMet = quest.breakpoints[0].findIndex((bp) =>
        progress == null || isNaN(progress) ? true : bp > progress
      );
      numBreakpointsMet =
        numBreakpointsMet === -1 ? numBreakpoints : numBreakpointsMet;
      quest.breakpoints[1].forEach((reward, index) => {
        if (index < numBreakpointsMet) numEarned += reward;
        else numRemaining += reward;
      });
    });
    return { numEarned, numRemaining };
  }, [questProgress]);

  return (
    <div>
      <div className='flex items-center justify-center py-4'>
        <div className='flex items-center gap-2 text-lg font-bold'>
          <LineSquiggle size={24} />
          <span>
            {numEarned} Earned | {numRemaining} Remaining
          </span>
          <Button
            variant='destructive'
            size='sm'
            onClick={clearQuests}
          >
            Clear
          </Button>
        </div>
      </div>
      <div className='grid gap-2 md:grid-cols-2 xl:grid-cols-3'>
        {Quests.map((quest) => (
          <QuestTracker
            key={quest.name}
            quest={quest}
            progress={questProgress[quest.name]}
            onProgressChange={onProgressChange}
          />
        ))}
      </div>
    </div>
  );
}
