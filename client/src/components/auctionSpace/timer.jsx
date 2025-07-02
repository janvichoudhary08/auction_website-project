import React, { useState, useEffect } from 'react';

const AuctionTimer = ({ productId }) => {
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Fetch auction timer details
  useEffect(() => {
    if (!productId) return;

    fetch(`http://localhost:3001/api/auctionSpace/timer?id=${productId}`, {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    })
      .then(response => response.json())
      .then(data => {
        if (data.endTime) {
          const endTimestamp = new Date(data.endTime).getTime();
          setEndTime(endTimestamp);
          setTimeLeft(endTimestamp - Date.now());
        }
      })
      .catch(error => console.error("Error fetching auction timer:", error));
  }, [productId]);

  // Timer countdown logic
  useEffect(() => {
    if (!endTime) return;

    const updateTimer = () => {
      const remainingTime = endTime - Date.now();
      setTimeLeft(remainingTime > 0 ? remainingTime : 0);
    };

    updateTimer(); // Run immediately to prevent delay
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  // Format time into a readable format
  const formatTime = (time) => {
    if (time <= 0) return "Auction ended";

    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div>
      Time Left: {formatTime(timeLeft)}
    </div>
  );
};

export default AuctionTimer;
