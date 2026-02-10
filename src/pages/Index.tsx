import { IDEProvider } from '@/contexts/IDEContext';
import IDELayout from '@/components/ide/IDELayout';

const Index = () => (
  <IDEProvider>
    <IDELayout />
  </IDEProvider>
);

export default Index;
