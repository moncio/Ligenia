import { setMockContainer } from '../../src/api/middlewares/auth.middleware';
import { createMockContainer } from '../utils/container-mock';

// Create and set the mock container for tests
const mockContainer = createMockContainer();
setMockContainer(mockContainer);

export { mockContainer }; 