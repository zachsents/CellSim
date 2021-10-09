close all
clear
clc

data = readtable('sim_output.csv');

hold on
plot(data.Time, data.LacI, '.')
plot(data.Time, data.TetR, '.')
%plot(data.Time, data.pLac, '.')
%plot(data.Time, data.pTet, '.')
plot(data.Time, data.aTc ./ 10, '.')
plot(data.Time, data.IPTG ./ 10, '.')
legend('LacI', 'TetR', 'aTc', 'IPTG')
xlabel('Time (s)')
ylabel('Concentration')