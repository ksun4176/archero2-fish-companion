"use client"

import React, { useState, useEffect } from 'react';
import { RotateCcw, Info, Undo2, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image'

enum Lake {
  LAKEHOUSE = 1,
  SUNSET = 2,
  OCEANIC = 3,
  POLAR = 4
}

enum FishType {
  RARE = "Rare",
  EPIC = "Epic",
  LEGENDARY = "Legendary"
}
const baselinePercent = 0.025;
const getFishCounts = (lake: Lake) => {
  let totalFish = 40;
  if (lake === Lake.POLAR) {
    totalFish = 80;
  }

  return {
    [FishType.RARE]: totalFish * 0.75, // 37.5% small + 25% medium + 12.5% large
    [FishType.EPIC]: totalFish * 0.225, // 15% small + 7.5% large
    [FishType.LEGENDARY]: totalFish * 0.025,
  }
}
const getFishTotal = (fishCounts: ReturnType<typeof getFishCounts>) => {
  return fishCounts[FishType.LEGENDARY] + fishCounts[FishType.EPIC] + fishCounts[FishType.RARE];
}
const getLegendaryPercent = (fishCounts: ReturnType<typeof getFishCounts>) => {
  const total = getFishTotal(fishCounts);
  return total > 0 ? (fishCounts[FishType.LEGENDARY] / total) : 0;
}
const getOddsButtonColor = (fishCounts: ReturnType<typeof getFishCounts>) => {
  const legendaryPercent = getLegendaryPercent(fishCounts);
  if (legendaryPercent > baselinePercent) return 'text-green-300 dark:text-green-900';
  if (legendaryPercent < baselinePercent) return 'text-red-400 dark:text-red-700';
  return '';
}
const getOddsCardColor = (fishCounts: ReturnType<typeof getFishCounts>) => {
  const legendaryPercent = getLegendaryPercent(fishCounts);
  if (legendaryPercent > baselinePercent) return 'text-green-600 dark:text-green-400';
  if (legendaryPercent < baselinePercent) return 'text-red-600 dark:text-red-500';
  return '';
}
const getLegendaryOddsSymbol = (fishCounts: ReturnType<typeof getFishCounts>) => {
  const legendaryPercent = getLegendaryPercent(fishCounts);
  if (legendaryPercent > baselinePercent) return '↑';
  if (legendaryPercent < baselinePercent) return '↓';
  return '';
}
const getFishCardColor = (type: FishType) => {
  switch (type) {
    case FishType.LEGENDARY:
      return 'bg-card-fish-legendary';
    case FishType.EPIC:
      return 'bg-card-fish-epic';
    case FishType.RARE:
      return 'bg-card-fish-rare';
  }
}
const getFishButtonColor = (type: FishType) => {
  switch (type) {
    case FishType.LEGENDARY:
      return 'bg-button-fish-legendary';
    case FishType.EPIC:
      return 'bg-button-fish-epic';
    case FishType.RARE:
      return 'bg-button-fish-rare';
  }
}

type LakeData = {
  fishCounts: ReturnType<typeof getFishCounts>,
  lastAction?: { type: FishType, count: number }
}

type StoredState = {
  currentLake: Lake,
  numThreads: number,
  LakesData: {[lake in Lake]: LakeData}
}

export default function Home() {
  const [currentLake, setCurrentLake] = useState(Lake.LAKEHOUSE);
  const [numThreads, setNumThreads] = useState(0);
  const [lakesData, setLakesData] = useState<{[lake in Lake]: LakeData}>({
    [Lake.LAKEHOUSE]: { fishCounts: getFishCounts(Lake.LAKEHOUSE) },
    [Lake.SUNSET]: { fishCounts: getFishCounts(Lake.SUNSET) },
    [Lake.OCEANIC]: { fishCounts: getFishCounts(Lake.OCEANIC) },
    [Lake.POLAR]: { fishCounts: getFishCounts(Lake.POLAR) },
  });
  const [showInfo, setShowInfo] = useState(false);
 
  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fishingTrackerV2');
    if (saved) {
      try {
        const data = JSON.parse(saved) as StoredState;
        if (data.currentLake) {
          setCurrentLake(data.currentLake);
        }
        if (data.numThreads) {
          setNumThreads(data.numThreads);
        }
        // Merge saved data with defaults to handle any missing lakes
        setLakesData(prev => {
          const current = { ...prev }
          Object.keys(data.LakesData || {}).forEach(r => {
            const lake = Lake[r as keyof typeof Lake];
            current[lake] = {
              ...current[lake],
              ...data.LakesData[lake]
            }
          })
          return current;
        })
      } catch {
        console.warn('Failed to load saved state');
      }
    }
  }, []);
 
  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      currentLake,
      numThreads,
      LakesData: lakesData
    };
    localStorage.setItem('fishingTrackerV2', JSON.stringify(state));
  }, [currentLake, numThreads, lakesData]);
 
  const currentLakesData = lakesData[currentLake];
  const { fishCounts, lastAction } = currentLakesData;
 
  const updateLakeData = (lake: Lake, updates: LakeData) => {
    setLakesData(prev => ({
      ...prev,
      [lake]: {
        ...prev[lake],
        ...updates
      }
    }));
  };
 
  const handleLakeChange = (newLake: Lake) => {
    setCurrentLake(newLake);
  };
 
  const resetCurrentLake = () => {
    updateLakeData(currentLake, {
      fishCounts: getFishCounts(currentLake)
    });
  };
 
  const resetAllLakes = () => {
    const resetData: Record<Lake, LakeData> = {} as Record<Lake, LakeData>;
    Object.values(Lake).filter((v) => typeof v === 'number').forEach(lake => {
      resetData[lake] = {
        fishCounts: getFishCounts(lake)
      };
    });
    setLakesData(resetData);
  };
 
  const catchFish = (type: FishType) => {
    if (fishCounts[type] > 0) {
      const newCounts = {
        ...fishCounts,
        [type]: fishCounts[type] - 1
      };
      updateLakeData(currentLake, {
        fishCounts: newCounts,
        lastAction: { type, count: 1 }
      });
    }
  };
 
  const undoLastAction = () => {
    if (lastAction) {
      const newCounts = {
        ...fishCounts,
        [lastAction.type]: fishCounts[lastAction.type] + lastAction.count
      };
      updateLakeData(currentLake, {
        fishCounts: newCounts
      });
    }
  };
 
  const incrementThread = () => {
    if (numThreads < 120) {
      setNumThreads(threads => threads + 1)
    }
  };
 
  const resetThreads = () => {
    setNumThreads(0)
  };
  
  return (
    <div className="max-w-md mx-auto p-4 min-h-screen">
      <div className="flex items-center justify-between mb-4 ">
        <h1 className="text-2xl font-bold">Fishing Companion</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={()=> setShowInfo(!showInfo)}
        >
          <Info size={20} />
        </Button>
        <a href='https://ko-fi.com/O4O71FBM0I' target='_blank'>
          <Image
            height={36}
            width={143}
            className="h-[36px] w-[143px] border-0"
            src='https://storage.ko-fi.com/cdn/kofi5.png?v=6'
            alt='Buy Me a Coffee at ko-fi.com'
            unoptimized
          />
        </a>
      </div>
 
      {showInfo && (
        <div className="mb-4 p-2 bg-secondary border rounded-lg text-sm">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ul className="space-y-1 list-disc pl-4">
            <li>Track how many gold tickets you need</li>
            <li>Track how many line breaks you have left</li>
            <li>If you have enough silver tickets, go for easiest gold tickets</li>
          </ul>
        </div>
      )}
 
      <div className="mb-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {Object.values(Lake).filter((v) => typeof v === 'number').map(lake => {
            const isActive = currentLake === lake;
            const lakeFishCounts = lakesData[lake].fishCounts;
            return (
              <Button
                key={lake}
                onClick={() => handleLakeChange(lake)}
                className={`h-auto transition-all flex flex-col ${
                  isActive ? 'bg-button-pool-selected' : 'bg-button-pool'
                }`}
                aria-label={`Switch to lake ${lake}`}
              >
                <div className="text-sm">Lake {lake}</div>
                <div className="text-xs">{`${getFishTotal(lakeFishCounts)} fish`}</div>
                <div className={`text-xs ${getOddsButtonColor(lakeFishCounts)}`}>
                  {`${(getLegendaryPercent(lakeFishCounts)*100).toFixed(1)}% ${getLegendaryOddsSymbol(lakeFishCounts)}`}
                </div>
              </Button>
            )
          })}
        </div>
      </div>
 
      <div className="flex gap-2 mb-4">
        <Button
          onClick={resetCurrentLake}
          variant={getFishTotal(fishCounts) === 0 ? "default": "secondary"}
          size="lg"
          className='flex-1'
          aria-label="Reset current lake"
        >
          <RotateCcw size={14} />
          Reset Lake {currentLake}
        </Button>
        <Button
          onClick={resetAllLakes}
          variant="secondary"
          size="lg"
          className='flex-1'
          aria-label="Reset all lakes"
        >
          <RotateCcw size={14} />
          Reset All
        </Button>
        <Button
          onClick={undoLastAction}
          disabled={!lastAction}
          variant="secondary"
          size="lg"
          aria-label="Undo last action"
        >
          <Undo2 size={14} />
          Undo
        </Button>
      </div>
 
      <div className="space-y-4 mb-4">
        {Object.values(FishType).map((type) => (
          <Card key={type} className={`${getFishCardColor(type)}`}>
            <CardContent>
              <div className="flex items-center gap-2">
                <h3 className="flex-1 font-semibold text-lg">{type}</h3>
                <p className="text-2xl font-bold">{fishCounts[type]}</p>
                <Button
                  onClick={() => catchFish(type)}
                  disabled={fishCounts[type] === 0}
                  className={`${getFishButtonColor(type)}`}
                  aria-label={`Catch ${type.toLowerCase()} fish`}
                >
                  Catch
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
        
      <Card className="mb-4 bg-muted">
        <CardContent className='text-lg'>
          <div className="flex items-center gap-1">
            Fish remaining:
            <span className="font-bold">{getFishTotal(fishCounts)}</span>
          </div>
          <div className="flex items-center gap-1">
            Chance next fish is Legendary:
            <span className={`font-bold ${getOddsCardColor(fishCounts)}`}>
              {`${(getLegendaryPercent(fishCounts)*100).toFixed(1)}% ${getLegendaryOddsSymbol(fishCounts)}`}
            </span>
          </div>
        </CardContent>
      </Card>
 
      <Card className='mb-4 bg-muted'>
        <CardContent className='flex items-center gap-2'>
          <div className='flex-1 flex flex-col'>
            <h4 className="flex-1 flex items-center gap-2">
              <Scissors size={16} />
              Broken Lines
            </h4>
            <div className="font-bold">{numThreads}/120</div>
          </div>
          <Button
            onClick={incrementThread}
            disabled={numThreads >= 120}
            aria-label='Add broken line'
          >
            +1 Break
          </Button>
          <Button
            variant='outline'
            onClick={resetThreads}
            disabled={numThreads === 0}
            aria-label='Reset thread counter'
          >
            Reset
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};