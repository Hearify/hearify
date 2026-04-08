export const formatTime = (timeString: string): string => {
  const digits = timeString.replace(/\D/g, '');
  const parts = [];

  for (let i = 0; i < digits.length; i += 2) {
    let part = digits.substring(i, i + 2);
    if (part.length === 1) {
      part = `0${part}`;
    }
    parts.push(part);
  }

  while (parts.length < 3) {
    parts.push('00');
  }

  return parts.join(':');
};

//  Function for converting a number to hh:mm:ss format
//  Examples:
//  233 --> 23:03:00
//  2333 --> 23:33: 00

export const formatSecondsIntoTime = (secondsProp: number) => {
  let hours = Math.floor(+secondsProp / 3600).toString();
  let minutes = Math.floor((+secondsProp - +hours * 3600) / 60).toString();
  let seconds = Math.floor(+secondsProp - +hours * 3600 - +minutes * 60).toString();

  if (+hours < 10) {
    hours = `0${hours}`;
  }
  if (+minutes < 10) {
    minutes = `0${minutes}`;
  }
  if (+seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${hours}:${minutes}:${seconds}`;
};

export const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const seconds = 0;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(remainingMinutes)}:${pad(seconds)}`;
};

export const formatSeconds = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.round(seconds % 60);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${hours ? `${pad(hours)}:` : ''}${pad(minutes)}:${pad(remainingSeconds)}`;
};
