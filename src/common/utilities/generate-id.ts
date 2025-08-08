import { randomInt } from 'crypto';
import { Repository } from 'typeorm';

export const generateNumberId = async (
  repo: Repository<any>,
  idName: 'nationalId',
  digits = 10,
  retries: number = 5,
): Promise<string> => {
  for (let i = 0; i < retries; i++) {
    const temp = Math.pow(10, digits);
    const min = temp / 10;
    const max = temp - 1;
    const randomNumber = String(randomInt(min, max));

    const existing = await repo.findOne({
      where: {
        [idName]: randomNumber,
      },
    });

    if (!existing) {
      return randomNumber;
    }
  }

  throw new Error('Generate random number failed.');
};
