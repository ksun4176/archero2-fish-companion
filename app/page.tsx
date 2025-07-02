"use client"

import React, { useState, useEffect } from 'react';
import { RotateCcw, Info, Undo2, Scissors, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

enum Lake {
  LAKEHOUSE = "Lakehouse",
  SUNSET = "Sunset",
  OCEANIC = "Oceanic",
  POLAR = "Polar"
}

enum FishType {
  SMALLRARE = "SR",
  MEDIUMRARE = "MR",
  LARGERARE = "LR",
  SMALLEPIC = "SE",
  LARGEEPIC = "LE",
  LEGENDARY = "LEG"
}
const getFishTotals = (lake: Lake) => {
  if (lake === Lake.POLAR) {
    return 80;
  }
  return 40;
}
const baselineLegPercent = 0.025;
const getFishCounts = (lake: Lake) => {
  const totalCount = getFishTotals(lake);
  return {
    [FishType.SMALLRARE]: totalCount * 0.375,
    [FishType.MEDIUMRARE]: totalCount * 0.25,
    [FishType.LARGERARE]: totalCount * 0.125,
    [FishType.SMALLEPIC]: totalCount * 0.15,
    [FishType.LARGEEPIC]: totalCount * 0.075,
    [FishType.LEGENDARY]: totalCount * baselineLegPercent,
  }
}

const getFishImgSrc = (lake: Lake, fishType: FishType) => {
  return `/archero2-fish-companion/Fish_${lake}_${fishType}.png`;
}

type LakeData = {
  fishCounts: ReturnType<typeof getFishCounts>,
  actionStack: FishType[]
}

type StoredState = {
  currentLake: Lake,
  numThreads: number,
  lakesData: {[lake in Lake]: LakeData}
}

export default function Home() {
  const [currentLake, setCurrentLake] = useState(Lake.LAKEHOUSE);
  const [numThreads, setNumThreads] = useState(0);
  const [lakesData, setLakesData] = useState<{[lake in Lake]: LakeData}>({
    [Lake.LAKEHOUSE]: { fishCounts: getFishCounts(Lake.LAKEHOUSE), actionStack: [] },
    [Lake.SUNSET]: { fishCounts: getFishCounts(Lake.SUNSET), actionStack: [] },
    [Lake.OCEANIC]: { fishCounts: getFishCounts(Lake.OCEANIC), actionStack: [] },
    [Lake.POLAR]: { fishCounts: getFishCounts(Lake.POLAR), actionStack: [] },
  });
  const [showInfo, setShowInfo] = useState(false);
 
  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fishingTracker');
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
          Object.keys(data.lakesData || {}).forEach(key => {
            const lake = key   as Lake;
            current[lake] = {
              ...current[lake],
              ...data.lakesData[lake]
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
    const state: StoredState = {
      currentLake,
      numThreads,
      lakesData
    };
    localStorage.setItem('fishingTracker', JSON.stringify(state));
  }, [currentLake, numThreads, lakesData]);
 
const getNumUncaughtFish = (lake: Lake) => {
    const fishCounts = lakesData[lake].fishCounts;
    let total = 0;
    Object.values(fishCounts).forEach(count => {
      total += count;
    });
    return total;
  }
  const getOddsInfo = (lake: Lake) => {
    const fishCounts = lakesData[lake].fishCounts;
    const numUncaughtFish = getNumUncaughtFish(lake);
    
    const percentage = numUncaughtFish > 0 ? fishCounts[FishType.LEGENDARY] / numUncaughtFish : 0;
    let color = '';
    let symbol = '';
    if (percentage > baselineLegPercent) {
      color = 'text-green-300';
      symbol = ' ↑';
    }
    else if (percentage < baselineLegPercent) {
      color = 'text-red-400';
      symbol = ' ↓';
    }
    return {
      color,
      repr: `${(percentage*100).toFixed(1)}%${symbol}`
    }
  }

  const currentLakesData = lakesData[currentLake];
  const { fishCounts: currentFishCounts, actionStack: currentActionStack } = currentLakesData;
  const currentOddsInfo = getOddsInfo(currentLake);
  
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
    if (!newLake) { return; }
    setCurrentLake(newLake);
  };
 
  const resetCurrentLake = () => {
    updateLakeData(currentLake, {
      fishCounts: getFishCounts(currentLake),
      actionStack: []
    });
  };
 
  const catchFish = (type: FishType) => {
    if (currentFishCounts[type] > 0) {
      const newCounts = {
        ...currentFishCounts,
        [type]: currentFishCounts[type] - 1
      };
      currentActionStack.push(type);
      updateLakeData(currentLake, {
        fishCounts: newCounts,
        actionStack: [...currentActionStack]
      });
    }
  };
 
  const undoLastAction = () => {
    const lastType = currentActionStack.pop();
    if (lastType) {
      const newCounts = {
        ...currentFishCounts,
        [lastType]: currentFishCounts[lastType] + 1
      };
      updateLakeData(currentLake, {
        fishCounts: newCounts,
        actionStack: [...currentActionStack]
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

  const resetAll = () => {
    const resetData: Record<Lake, LakeData> = {} as Record<Lake, LakeData>;
    Object.values(Lake).forEach(lake => {
      resetData[lake] = {
        fishCounts: getFishCounts(lake),
        actionStack: []
      };
    });
    setLakesData(resetData);
    resetThreads();
  };
  
  return (
    <div className="max-w-md mx-auto p-4 min-h-screen">
      <div className="flex items-center justify-between mb-4 ">
        <h1 className="text-xl font-bold">Fishing Companion</h1>
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
            <li>Track the fish you have caught in each lake</li>
            <li>Track how many line breaks you have left</li>
            <li>If you have enough silver tickets, go for easiest gold tickets</li>
          </ul>
        </div>
      )}
 
      <div className="flex flex-col items-center mb-4">
        <div className="mb-2">Select a Lake</div>
        <ToggleGroup
          variant="outline"
          type="single"
          value={currentLake}
          onValueChange={handleLakeChange}
        >
          {Object.values(Lake).map(lake => {
            const oddsInfo = getOddsInfo(lake);
            return (
                <ToggleGroupItem
                  key={lake}
                  value={lake}
                  className='h-fit py-2'
                >
                  <div className="flex flex-col">
                    <div>{lake}</div>
                    <div className='text-xs'>{`${getNumUncaughtFish(lake)} fish`}</div>
                    <div className={`text-xs ${oddsInfo.color}`}>
                      {oddsInfo.repr}
                    </div>
                  </div>
                </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
      </div>

       <div className='grid grid-cols-3 gap-2 mb-4'>
        {Object.values(FishType).map(type => (
          <Button
            key={type}
            onClick={() => catchFish(type)}
            disabled={currentFishCounts[type] === 0}
            className='h-fit'
            aria-label={`Catch ${type.toLowerCase()} fish`}
          >
            <div className='flex flex-col'>
              <Image
                className="h-[36px]"
                src={`${getFishImgSrc(currentLake, type)}`}
                alt={`${currentLake} ${type} fish`}
                width={36}
                height={36}
                unoptimized
              />
              <div>{`${currentFishCounts[type]} left`}</div>
            </div>
          </Button>
        ))}
      </div>

      <Card className="mb-4">
        <CardContent className='text-lg'>
          <div className="flex items-center gap-1">
            Fish remaining:
            <span className="font-bold">{getNumUncaughtFish(currentLake)}</span>
          </div>
          <div className="flex items-center gap-1">
            Chance next fish is Legendary:
            <span className={`font-bold ${currentOddsInfo.color}`}>
              {currentOddsInfo.repr}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className='flex gap-2 mb-4'>
        <Button
          onClick={resetCurrentLake}
          variant={getNumUncaughtFish(currentLake) === 0 ? "default": "secondary"}
          size="lg"
          className='flex-1'
          aria-label="Reset current lake"
        >
          <RotateCcw size={14} />
          Reset Lake
        </Button>
        <Button
          onClick={undoLastAction}
          disabled={currentActionStack.length === 0}
          variant="secondary"
          size="lg"
          aria-label="Undo last action"
        >
          <Undo2 size={14} />
          Undo Catch
        </Button>
      </div>
      
      <Card className='mb-4'>
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

      <Button
        onClick={resetAll}
        variant="destructive"
        className='w-full'
        aria-label="Reset all data"
      >
        <X size={14} />
        Reset All
      </Button>
    </div>
  );
};