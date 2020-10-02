import { Router } from 'express';

import GradesController from '@modules/grades/infra/http/controllers/GradesController';
import ensureAuthenticated from '@shared/infra/http/middlewares/ensureAuthenticated';

const gradesRouter = Router();
const gradesController = new GradesController();

gradesRouter.use(ensureAuthenticated);
gradesRouter.get('/', gradesController.index);
gradesRouter.post('/', gradesController.create);
gradesRouter.put('/:id', gradesController.update);

export default gradesRouter;
