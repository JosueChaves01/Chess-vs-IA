import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { incrementTimer, setTimerActive } from '../store/slices/uiSlice';
import { selectTimerActive } from '../store/selectors/uiSelectors';
import { selectWinner } from '../store/selectors/gameSelectors';

export function useTimer() {
  const dispatch = useDispatch();
  const timerActive = useSelector(selectTimerActive);
  const winner = useSelector(selectWinner);

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => dispatch(incrementTimer()), 1000);
    return () => clearInterval(interval);
  }, [timerActive, dispatch]);

  useEffect(() => {
    if (winner) dispatch(setTimerActive(false));
  }, [winner, dispatch]);
}
