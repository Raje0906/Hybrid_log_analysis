// Sample log presets
export const SAMPLE_LOGS = [
  {
    label: "🔴 HDFS Anomaly",
    mode: "anomaly",
    log: `081109 203615 148 INFO dfs.DataNode$PacketResponder: PacketResponder 1 for block blk_38865049064139660 terminating
081109 203615 149 ERROR dfs.DataNode$DataXceiver: java.io.IOException: Block blk_38865049064139660 is not valid
081109 203616 150 WARN dfs.FSNamesystem: BLOCK* NameSystem.addStoredBlock: block blk_38865049064139660 is already stored in 3 locations, but only requires 2 copies
081109 203616 151 ERROR dfs.DataNode: reportBadBlocks has exception
081109 203616 152 FATAL dfs.DataNode: Unexpected exception while sending block blk_38865049064139660 to /10.251.42.58:50010
java.io.IOException: Connection refused: /10.251.42.58:50010
    at sun.nio.ch.SocketChannelImpl.checkConnect(Native Method)
    at sun.nio.ch.SocketChannelImpl.finishConnect(SocketChannelImpl.java:574)`,
  },
  {
    label: "🟢 Normal System Log",
    mode: "anomaly",
    log: `2024-01-15 10:22:31 INFO  kernel: EXT4-fs (sda1): mounted filesystem with ordered data mode
2024-01-15 10:22:32 INFO  systemd[1]: Started Network Time Synchronization.
2024-01-15 10:22:33 INFO  ntpd[1234]: synchronized to 192.168.1.1, stratum 2
2024-01-15 10:22:35 INFO  sshd[5678]: Accepted publickey for admin from 192.168.1.100 port 54321 ssh2
2024-01-15 10:22:40 INFO  cron[9012]: (root) CMD (/usr/lib/cron/run-crons)
2024-01-15 10:22:45 INFO  kernel: NET: Registered protocol family 17
2024-01-15 10:23:01 INFO  systemd[1]: Starting Daily apt download activities...`,
  },
  {
    label: "🔵 NL2SQL Query",
    mode: "nl2sql",
    log: `Show me all critical error logs from the authentication service in the last 24 hours, grouped by host, ordered by count descending, and only include hosts that had more than 5 failures.`,
  },
];

export const MODES = [
  {
    id: "anomaly",
    label: "Anomaly Detection",
    icon: "⚡",
    description: "Classify log as Normal / Anomalous",
  },
  {
    id: "rca",
    label: "Root Cause Analysis",
    icon: "🔍",
    description: "Explain what went wrong and why",
  },
  {
    id: "nl2sql",
    label: "NL→SQL",
    icon: "🗄️",
    description: "Convert question to SQL query",
  },
];
