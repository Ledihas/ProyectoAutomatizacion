import { useState, useEffect } from 'react';
import { useList, useCreate, useUpdate, useDelete } from '@refinedev/core';
import { Instance } from '../types';

export const useInstances = () => {
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);

  const { data, isLoading, refetch } = useList<Instance>({
    resource: 'instances',
    sorters: [{ field: 'createdAt', order: 'desc' }],
  });

  const { mutate: createInstance } = useCreate();
  const { mutate: updateInstance } = useUpdate();
  const { mutate: deleteInstance } = useDelete();

  const instances = data?.data || [];

  useEffect(() => {
    if (instances.length > 0 && !selectedInstance) {
      const lastConnected = instances.find(i => i.status === 'connected');
      setSelectedInstance(lastConnected || instances[0]);
    }
  }, [instances, selectedInstance]);

  const switchInstance = (instance: Instance) => {
    setSelectedInstance(instance);
  };

  return {
    instances,
    selectedInstance,
    switchInstance,
    isLoading,
    refetch,
    createInstance,
    updateInstance,
    deleteInstance,
  };
};
