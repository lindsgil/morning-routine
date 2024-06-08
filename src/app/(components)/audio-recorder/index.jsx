'use client'

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Button } from '../button';
import { CONTRACT_ABIS, CONTRACT_ADDRESS } from '@/utils/constants';
import { usePublicClient, useWalletClient } from 'wagmi';
import { submitOnChain } from '@/app/(actions)/submit-on-chain';
import { useToast } from '../toast/use-toast';

const AudioRecorder = ({tokenId}) => {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const { toast } = useToast()
    const mediaRecorderRef = useRef(null);

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks = [];

            mediaRecorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        }
    };

    const handleCheckIn = async() => {
        let formData;
        try {
            formData = new FormData();
            formData?.append('audio', audioBlob, 'audio.wav');
        } catch (error) {
            console.log("error appending form data")
        }

        // queue tx to check in
        const transactionInputs = {
            contractAddress: CONTRACT_ADDRESS,
            contractAbi: CONTRACT_ABIS.checkIn,
            contractFunctionName: "checkIn",
            transactionArgs: [tokenId]
        }
        const data = await submitOnChain(transactionInputs, walletClient, publicClient)

        if (data?.status === "ERROR") {
            toast({
                description: "Error checking in, try again..",
            })
        } else {
            toast({
                description: "Check in successful",
            })
        }

        try {
            // upload audio blob
            const config = {
                headers: {'content-type': 'multipart/form-data'}
            }

            await axios.post('api/upload-audio', formData, config);
        } catch (error) {
            console.log("error uploading audio blob")
        }
    }

    return (
        <div className="mt-[40px]">
        { isRecording ? (
            <Button className="w-[150px] bg-blue text-white" onClick={handleStopRecording}>Stop Recording</Button>
        ) : (
            <Button className="w-[150px] bg-blue text-white" disabled={tokenId === null} onClick={handleStartRecording}>Start Recording</Button>
        )}
        { audioBlob && (
            <div className="flex justify-center mt-[40px]">
                <audio controls src={URL.createObjectURL(audioBlob)}></audio>
            </div>
        )}
        { audioBlob && !isRecording ? (
            <Button className="w-[150px] bg-blue text-white mt-[40px]" onClick={handleCheckIn}>GM</Button>
        ): <></>}
        </div>
    );
};

export default AudioRecorder;
