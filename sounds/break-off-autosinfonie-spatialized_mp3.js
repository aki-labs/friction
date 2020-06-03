/* eslint-disable */
import simLauncher from '../../joist/js/simLauncher.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swZAAAAP4c1cUMYAQAAAgAoAgBCAzHe5j1AAAiACcTACACKQCAIPrv9dCocDc/Pnu5x3d/9HOBABC//iITgAAn3E//LQD5yUSd3xwAAJbILbN+uvn2QyYy9FJtkpMHgXkZBrPCzqDe9QbSegZPiuK75CJ3ICLnv5C/lH5/tTqxxLyrAAAACAAAAf9KW1hFrAEGA7Na9Zp77Y00//syZAeAkZ4w3Wcw4A4PgBiF4IAABYTDd6K85rAtgGIAAAAAAEamJcJwilnOzR0dF7f+cIwFSP/oFRJNb/Q4Z//KF//qIr4nbKCEC2XdHK//9LunMfq7BaAawS0guNAAAz+5bQoLdkjNRUqM7PmH0//QW/+poCAa3/lQeL/7ioXf/QDC//+xP//1/3sz6yBuY2sD2QSzYABeWtVWvP/7MmQGgBGCMVvoLFFcDGAIgAAAAAY0w1+hYajwNoAjJAAAAHtgBEFT/MQ22h48OFn/6lBN//HwgD/+7A2t/7hWE7/7AXDR//1dBX/v/6KsjSlwogLWFKgjEQAC/CByB6SG5QYyPJF7GdPYzw6zpCf/1lQ2v/6iaMlL/1DKf/3OH//rCtRCAA9CNX/INv2/6f//1QBYw7YFLCAB2zn/+zJkBQBRaTDX6Bg5TBCAGLkEAAAFQMNZoD1FMDAAYgAQAABTVYKoRxsViVXRAkWO55giN/8oW/9TQgD2/8qGG/90f/8IC+RhGAMADo368v///i3W5l1AAlgUEDkaAAzZhUKuOl8A6G2sz6IFRfOFn/8XCj/7iKT/8r/+j//MALEhe/1/+n//1rs7nsiqAFBMdgAwz5XfROcCA43n//swZAeBEX8wzEgcaVAPgBiZAAAABYzDKFXFAAA+gGHCggAAFDHAOTDdyNxuWW8PKxlP/8fht/+odrf/l7/9T//OgaSiQEAsAAAvo/Rf27v//+/ipof///5WaaNN1WGCwdNIcM0EGygFtLk5UblTv//qJQKTv/p//Jf///zEAYDdMZpt9f3u/9XGK0r+L3hpNf/Ogpef13C877Pq//syZAWAAVMx04ZpoAASABigwAAABhDDVb2TgBgygGJXgAAAyi+ZMyCkZ8CgONNBYGZkbc3Rf/f0P//////+pBD6RY1Hs1/2f37O3VWsmABz7WDmAqBGwEhRMKYAP//+tKpdTRKs4SVRy2DzN2SQ8Ipan3/+cFglN/+v/6jz////wPNQhS6JEAv0+7/V////bsFlB0AAQBgABerUVv/7MmQFCBFjMU9QPGlADEAYgAAAAAWgwzzgbaOQOAAiVAAAAFz7PCosOCsh+ZhwNrBQTMGh88///5EIP///+a////3CwI7Uet/196r/d7v/Z6jJBACCAP08LIoy7sPMtMDAj4M4M4kmXunJRQ1qv//ewYhRS////v////UB2NNBCBafs///tot9i6XzHJoCQADAAD6yYIGaE2QAMvj/+zJkB4ExazDNyqBuJA7AGJUAAAAFNMU0wPWlUCYAIxAAAAQYEDwHK8YBmwLA2LEoDNkXLhuh//+Poef/+oxAKcggCkj/7fo/v29/7/e1oCQMQwfq1LYeZU3FHYUDUcjsw8CFKp4ZickU7a///H4o////7f///3CVG9g5GGAne5qL/XpqQD6jEpEyOaLiC6kDCoOA7ZNAGM0CwdED//swZAwB8UMwy4qgjiALgBiAAAAABMDDN0BtRUBBAGHAAAAAjgJgsnDv//6m//6zgFccbQ39//7///3aRri61AOBAKAMM7E3KGlhYIOl4jIAJdcORuNyy3h//+jf///////+oD45//qTpXT/3r7qzQpUTLkqjNUC0cBAAQAP3RIsMsUReBIGBieoXTGOLqBUKxVP///3//+BRgwI//syZBKDIRgw0NKAPiQMIBkrAAABhVTFQRWjgBA7ACKmgCAAwAGEF+xv+///9QPI////+btxfVPKmUMBOYWHuau4f4WBeE4Rj7nWdf/sS////////9wChhgQ1DMDdmVW+z////5XouWRyQgaDYay0QCNgAAAB/2fOTCe+AmCx0BUK8kUlel2bjueZ8UgDUkAZWiY4hQLNikAwCQ0cP/7MmQagAKcMdduYoAEAAAI8MAAAATQw01dUoAARoAhg4IgAPFKEcOwi5lUbapUTUfQU6K/2Vev//s5ZM/WL/8XpXAkAAcAAAD9ZdYxICREZ0AFIgQAIcqQVAhjP//+jf///////+oEFur7Hdntp0Wo9WnjpBoYKtigugJWgoAKAAAB9RiTSJdNidLwHoIGHk+xgdSX//+pv//hEwH/+zJkEQMxCTDW6iA+LA2gGUwAAAGDqMNciIC4sCCAZlAAiAYcDgDoAAKGMbRb7rOgAWoOAfoGaBmgXzAAHDQFxk4Xy+aJof//qb//4TYUXACwWJt+xFUAVsOgCgAgAfpGqSRiPoshGJOkOOqND55L//9Tf//DB7RCAG32+///d9H0ab419hFf///rdarLYeaaYCAHrXwlxJQvnLKl//swZCMCMQEw12pgLiwQgBh1AAAAA3jDNg2BsYA4AGUQAAAG3W//6gbyAgEADYnq2+xj//////0K////wz5uUMrBAONoxYxwClN3cjdPYzw//rCZlH1o93/Tv//s77VU0f///9xppVAK+hQPmEMmY+B6w0RuctY5f/3BBG7EUAIG1V/7///3/19a9NX///+vlYlcSLYBQSOqdjfw//syZDGPEOIwzQOAbGALoBiAAAAAA5DFMA4BUYA3AGKgAAAA+SvfFC4ddP///////////9QSY2bfX27PRX+0r2WXEPjN68L/8zATcwsAvYwwQWAphkZmLyCZ9IC6DIhNWYaAuhyg5ZXIYMcCvycNEw8Asky/ubk0TJQ+n5k6KKv/07b/ctfLJqyLyZCxsUdjYqg5oq3d711Xt/sIev/7MmREgAEgMUsFbaAAD2AYgKAAAAj0xzAZyAAATQBigwAgALLFeoqA1QKmAAOMAEAB//+X7paW7KbFOYnqXtWrDt5Djn87/+jf///////80hAZE4AADAAUABwAfq/0/////ppD9GAQAAAD6jpSJkc0vERFzAbxMCyYVEtmhgdUv//9Tf//EHwXaAH7b3fZ7XevbT/f1+oCwIBQAAD/+zJkOYCBUjDT72lACBAAGf3gAAGEXMFNSgD4kD+AYyQAAAAP0E2MzAcsG6AGb1kAUOBcZFC+XzRND//9X//4BjhrhqBaIAAAAt5GkyP8iv9QArINAGAH6RdNiaKI6gwaAanQFACQIxUeKxql//+r//8BXIrIogL4vdV32fp/+/9H60IAfw7gABgH//68kAroggJDZO9gIrn///////swZD+BER4w0NKgLiAP4BmtAAABhETDR6qAuIA/gGJkAAAA///////gnAGrEwAAQB/+WyC8BwgBBHF7QQVz////////////wp//DB/+f+43paLBuOq6htxEQOssInOTgsgqAPaAyM09M3FICcJdAx0BZPzdUNsKiKgtWGLT39ZNm/WPA31f8n31GhGCyHxeFX1YGBoKkAkPMAkQ//syREiAAP4w3GUkQAwfBhs8pBQBiPDHYBmZgAEVmOMDLUAAwHl+DgGLwIQHQ65oGH8I4G1HSgGCwIF3Rv/9Jso8wf9u399Xfq76JcAScBFEWu5qFnwpM1uUQKqwWU2b6sKsgFt8AFx5d81ZW8yy7oa3drJhxx1TRqgLjn/9Ra3/xUJR3/uEz//Hha3/nC4jkCv///91carswm+Yzv/7MkQfAPGWMWBvMOAGIYYZsO2cAAY4w3uhPUc4aRhlQbA2MCmMCYYCuLcLDYk////////////5oEXY+sE2IDaMAAX0UNV7Z7YfDkqY2sVtWijAiEK3/yETf/QfAHih//Khq3/R0Lf/UQPul////93MaWeeUvUeAxDWeng88sqV9b//qDoUlcOAwB/ACe+hWhIeMuB5QFihOGlzDG//+zBECwABVzDYzUzgAB+mGUCqnAADrElmGUKAAGyFakMyIAAfF7/+onBFP/g9P/+g//+ULf/QIC/7Os8UA4sSkBqNrALBgOYLIOuNEb///////////+ExDr5R5RAEHrBJAPIBp8105R+9PC3IeWrf1Os/6ujX/54//0uMR+ZdOwZkCsJoyyGQM9E7////+t+ToFqCYgcjYADf/bH/+zJEBYHxDjBebyxADB4mGiDqFAADdMF9oCBFMFaYaAFQFjBxotAkH4nXL/0E//qJ//OX/9v/0b/8B/R6YfqAQFA8SQDaig5YlyZFlK3///////////8BDAD+CUYWio6PBcAqo9HO36j//qN/+X/+////+C/6zAh4W4AympADhAM2XC+mg///AIcqAFaCYocjQAFqW5VqsejpUhfk//syRAkA8S0w2GgZOTwZBhnQVAqMBCzDb6OAWHBlGGbBUB4wRiqM7P7Db/9Rj/8ef/9P///8F7fuikXiZFeBADQMQxEDDQBFzEypnZ//6g6oG/geHFArAA+hUVCKA04i4BAyMOw4VRfQ3/9S3l////xn/WpE1Kw7QwUBrIgBRRB5h7JwwWpf/9ABBmp4YANEPZPQeG3HL6GXc0t5nP/7MkQIgPDlCtSoBsgwFKYZ4FQFjAT4w4GlgLiwUphnQVAeMEsZUnFg/f/////w5/1mBDwwgBkdJAKAgc8uJps///AZh/+g7+MAIAB5taI7R2rAeAF4cI7ic9psvLTWnOd7nf//uOO//+UKFf7JJGJDgvyBgdQgMB0gxiq///UQtQB/jeAMAGABKZojwTUXiv/o////1/1LRPloW4D/+zBEDgLwpwhiaAExDBPGGbBQAowDQMNWFUEAAGcYZsKoUADsCgWjjYK5ogv//xA/+tBhjxC4G3WADGBkCcXJ////////////xL/62MB9kkBu8QWICwEUyJ////////////gMiv//qNI8gBfRUFJ0A0bmuMihLMY5RVY0foTE4R2gSAcz8oP19rsk//t////qCAIXqCCKHxJh0Cr/+zJEG4ABrjHQBnGgADQmOjnMSACD/LdSGUEAAH2Y6YMyIAAULDDDARAAA//+UMA+AexqHEQyD86InSc31Dj7QA8C5j8dh9f+myZv/5p1////W31/mabq8gTRzZJgebsAoGA/bkPAD/Ic///////////4Nvg+T/X//w1Efs/TnxEhsE9vYfA7z///////////Bj/j/BPV/SSdIhwY//syRAMP8MQJ1AdQQAAZxgpQ6ggAAwQrThVRgABoGGkCqCAA2AJEAcvcCKafKRWCu//////hn9T1FIZYOSAycIHBCeMnVv///////////+G/UzqI8cYX7CBRgFB0QeOeb0W//////8Ofqao6QcQjABngiCkTL7q/////////////Dsr+DfodLEbgcwjwMDIHT0CCIYAdKF4EhP/////7MkQNAAE5Mc+GVOAAJsX7AMa0AEPsxU4ZQoAAcg2wQw5wAP//////8FTfgqT+KQ35o3pjYDYcM7BFRK/mH5oBIGv/GOHPQ/83MzcOeb//1l9N///NPBH8ikh8fgOywE+AciyJ/A2PgXB//////////9B/xj/Ct/TxIcNMDl/x8WxO8qX4QNk2xTzDOhGv7P99qK4f/sL8AACAAZH/+zBEBILw0QrjbxRADBnDe4DoHAACeMNYCgCxgGkYbMAQTBiU8ODgEZZ64sEELjnf////9SP/UkZAnE4l/2QFxJ//HALHP/4qPfK/kPw3+ipJiaLxfA1TIBg0fMTWi3//CbPSJkAmYoqTf8yHC3/zIev/um3/5t/+pv/zjwBbA4ACBGToZ0ACUH7gPnP/////5nuEvPgU4yB7f5X/+zJED4LwqgjcWAFhHBimGuADB0ICeMNMCoDxgGaYKsAdFQgPf/48CX/41//t/+n/8m39nSOj8EQGEWqFhpHHVM7f/6BEYv89XWwGVhPUNQ/+wl/+gN/+JP/+X/9P/4RVG2yBu1iB5EA2BM6oKbf6TpyFmd/XQWxfI4ZAIbCgDnmxopk/0f/7///CAf6h7iAAE0etRToLY9wsSI////syRB4C8J0K3qADSB4WhgrQSALEArAhfaAFInBdGGnBQBdI////X/ukdKofsBFsKUHEYoM/9//7//r//wYcAGiDgAwAYADALBqCOhGl0mlkDX/U7////DP+kkYk0HsgbXuFppPI////Uf//9YVqxiQdplIJYkcx8RQnto8AiK//////qA+DAwP1qZnPHwVIJkeepv//+///wj2l+//7MkQvAhDPCNroA4ksFmYaIFANxAKwJUygG0SAV5hqZTALEE4AuDAYa7hxjIEKbv5G6exm7/////8PdNCV+/LHfQmCMRccVGK552xkz/////6wY70SIgJkJVwjQG/fsUlch/////+v/rUWRKgMTiEcE2YJpoP///v//6gaquaFDR46K4wLTHEZIC2uPnFaXC0EjX/////rCwA9gnD/+zBEPY/wyQrPgAzhIBihWsAHDDQCgClMABtEgFaYakFAHxAEApAAYKzRWsB3GorBk9/3//q//hn+vQIuGNAPL0AYaDJk4bpof/+ArgDaiYAUAIAD+lnFIFcUeQ////f//4ZqAA7F4AwAQAH+cNqQuw2Nzm///3//+FAG0EwAIU5KVJFsqNDJn/////9QbjACkR+weiPcV2WHYGH/+zJES48A2QrUgCzRIBjhG60AaSOCfMNMCgCxgFqYbzRQCxbm7cxW/sOD9/1IomxFRAYDgWgROh2n2Uv//wcdA/6D3AAQBLYoRolbeDKqnXISAoz/////1h+B4AEOqGEwpy6hBB0t0asYNB3/////8OUiSAToqHCITmFemY0C6t0A1L1+8e//////DYA/4vAhOqIgLk8ScLf///////syZFiDILQwW+jgFiwTIQvLACshgsgxWIAFgDhQGGmBQBYw1rFEz0VTqOETiJ+Y7J7ARFf/////1f9SZAAQgQN9HAUnoG6CCf//QCxZHIHACq4EDxvHFGQgsim1x/5fSWzn/////4cEkgAUCFXcEgbqFjClnwfhgT/////+Wv7JJGJDgvyAaoQFBCQYxVf//wZ/heABzDpKwajy+v/7MERrAiDHCl9gCTCsGME62ABvFANQKz4AG4RARwQubACYhgTAgKEyPgkDRX/////63s8mTGZQa0M+OEAE1HIhyX5iAEAx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GpDI8BYyDgsZd////+GP93rIEBmlgULEiWzQ0TU3/+AK4AimXWrctaUDfBYqI4PTr///+zJk7I8Q5DDJyqBURByGGUBwB4wDqMUWDYGxgHyYZuVAKxb///8lEFAAA7CLOzKoaoZxNwa8NBtxqOzdJfxR2//7///+n////8SvgAD3f0MATuRrUkY6t8CAFrsknp0wKpp06Nrv8d+K/yz3Y3//muKok0AMQIyIAFcuYtrxa//t839ShnBUIACYQqUO9MyVjNCRmBW0BJdCFUM5//swZO4DMXwwzFHgFiAhRhl9UAqYgrDDMAoAUYBTBOkQBL0GLgaKncj//7v/8RElTEFNRTMuOTkuM1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//syROyAARwwyWg5OhQi4RktBHsiA5jDLakA9FB9BOT0PT1CVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MkTngzDmMMhqgBYQJMF5eQA5EoJUwxQKALGAUwRl4BBkElVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+zJk748BHTDEmDgRUCGBKOoFODIDTML4B4BRSIQFX8gTYIhVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = simLauncher.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();
const onDecodeSuccess = decodedAudio => {
  wrappedAudioBuffer.audioBuffer = decodedAudio;
  wrappedAudioBuffer.loadedProperty.set( true );
  unlock();
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBuffer = phetAudioContext.createBuffer( 1, 0, phetAudioContext.sampleRate );
  wrappedAudioBuffer.loadedProperty.set( true );
  unlock();
};
phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
export default wrappedAudioBuffer;