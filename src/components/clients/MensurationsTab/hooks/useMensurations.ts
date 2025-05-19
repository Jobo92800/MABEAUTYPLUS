import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getMensurations, addMensuration, updateTotalSessions, getTotalSessions } from '../../../../services/database';
import type { Mensuration } from '../../../../types/measurements';
import { calculateTotalLost } from '../utils/calculations';

export const useMensurations = (clientId: string, centerId: string) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [mensurations, setMensurations] = useState<Mensuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [newMensuration, setNewMensuration] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    bustLine: '',
    underBust: '',
    waist: '',
    belly: '',
    hips: '',
    rightArm: '',
    leftArm: '',
    rightThigh: '',
    leftThigh: '',
    rightCalf: '',
    leftCalf: ''
  });

  const fetchMensurations = async () => {
    try {
      setLoading(true);
      setError(null);
      const [mensurationsData, totalSessionsData] = await Promise.all([
        getMensurations(clientId, centerId),
        getTotalSessions(clientId)
      ]);
      setMensurations(mensurationsData);
      setTotalSessions(totalSessionsData || 0);
    } catch (error) {
      console.error('Error fetching mensurations:', error);
      setError('Error loading mensurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMensurations();
  }, [clientId, centerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMensuration(clientId, centerId, newMensuration);
      setShowAddForm(false);
      setNewMensuration({
        date: format(new Date(), 'yyyy-MM-dd'),
        bustLine: '',
        underBust: '',
        waist: '',
        belly: '',
        hips: '',
        rightArm: '',
        leftArm: '',
        rightThigh: '',
        leftThigh: '',
        rightCalf: '',
        leftCalf: ''
      });
      await fetchMensurations();
    } catch (error) {
      console.error('Error adding mensuration:', error);
      setError('Error adding mensuration');
    }
  };

  const handleTotalSessionsChange = async (value: number) => {
    try {
      await updateTotalSessions(clientId, value);
      setTotalSessions(value);
    } catch (error) {
      console.error('Error updating total sessions:', error);
      setError('Error updating total sessions');
    }
  };

  const totalLost = calculateTotalLost(mensurations);

  return {
    showAddForm,
    setShowAddForm,
    mensurations,
    loading,
    error,
    newMensuration,
    setNewMensuration,
    handleSubmit,
    fetchMensurations,
    totalLost,
    totalSessions,
    setTotalSessions: handleTotalSessionsChange
  };
};