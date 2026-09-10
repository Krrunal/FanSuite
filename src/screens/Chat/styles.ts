import { Color } from "@/constants/theme";
import { Dimensions, Platform, StatusBar, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Color.red,
        paddingVertical: 5,
        paddingHorizontal: 12,
    },

    offlineBannerText: {
        color: Color.white,
        fontSize: 12,
        fontWeight: '600',
    },

    actionToolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: '#F8FAFC',
        borderBottomWidth: 1,
        borderBottomColor: Color.border,
    },

    actionBtn: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 4,
    },

    actionBtnActive: {
        backgroundColor: Color.red,
        borderColor: Color.red,
    },

    actionBtnText: {
        fontSize: 11,
        fontWeight: '600',
        color: Color.lightBlack,
    },

    actionBtnTextActive: {
        color: Color.white
    },

    historyBtnActive: {
        backgroundColor: Color.purple,
        borderColor: Color.purple
    },

    historyBtnTextActive: {
        color: Color.white
    },

    clearBtn: {
        backgroundColor: '#FEE2E2',
        borderColor: '#FCA5A5',
    },

    clearBtnText: {
        fontSize: 11,
        fontWeight: '600',
        color: Color.red,
    },

    waitingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Color.lightBackground,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginTop: 2
    },

    waitingText: {
        fontSize: 10,
        color: Color.purple,
        fontWeight: '600',
    },

    failedPill: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 3,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 2
    },

    failedText: {
        fontSize: 10,
        color: Color.red,
        fontWeight: '600'
    },

    errorExplainerBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginTop: 6,
    },

    errorExplainerText: {
        fontSize: 10,
        color: Color.red,
    },

    container: {
        flex: 1,
    },

    safeArea: {
        flex: 1,
        backgroundColor: Color.white,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },

    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 52,
        borderBottomWidth: 1,
        borderBottomColor: Color.border,
    },

    backButton: {
        marginRight: 8,
        padding: 4,
    },

    titleText: {
        fontSize: 18,
        fontWeight: '700',
        color: Color.black1,
        letterSpacing: -0.2,
    },

    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        columnGap: 10,
    },

    searchFieldWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 42,
        backgroundColor: Color.white,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: Color.border,
        paddingHorizontal: 10,
        shadowColor: Color.black,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4.84,

        elevation: 1,
    },

    searchIcon: {
        marginRight: 8,
    },

    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        color: Color.black,
        paddingVertical: 0,
    },

    filterButton: {
        width: 42,
        height: 42,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: Color.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Color.white,
        shadowColor: Color.black,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4.84,
        elevation: 1,
    },

    listContent: {
        paddingBottom: 72,
    },

    chatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
        paddingLeft: 10,
        paddingRight: 16,
        paddingVertical: 8,
        backgroundColor: Color.white
    },

    selectedChatRow: {
        backgroundColor: '#EAEBFB',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12
    },

    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },

    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E2E8F0',
    },

    avatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: -3,
        width: 18,
        height: 18,
        borderRadius: 20,
        backgroundColor: '#D1D5DB',
        borderWidth: 2,
        borderColor: Color.white
    },

    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },

    headerLine: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Color.black
    },

    usernameText: {
        fontSize: 15.5,
        fontWeight: 'bold',
        color: Color.purple
    },

    messageLine: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    messageText: {
        fontSize: 13.5,
        color: Color.placeholder,
        maxWidth: '70%',
    },

    timeText: {
        fontSize: 14,
        color: Color.placeholder,
        marginLeft: 4,
    },

    trailingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
        marginLeft: 8,
    },

    miniAvatar: {
        width: 25,
        height: 25,
        borderRadius: 25,
    },

    statusDotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 3,
        paddingTop: 10
    },

    dot1: {
        width: 6,
        height: 6,
        borderRadius: 2.75,
        backgroundColor: '#D4D4D8',
        position: 'absolute',
        top: -0,
        left: 4,
    },

    dot: {
        width: 6,
        height: 6,
        borderRadius: 2.75,
        backgroundColor: Color.green,
    },

    moreButton: {
        padding: 4,
    },


    userBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Color.border,
    },

    userInfoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    fanAccessBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        shadowColor: Color.black,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4.84,

        elevation: 1,
    },

    fanAccessText: {
        color: Color.purple,
        fontSize: 14,
        fontWeight: '600',
        marginTop: -2
    },

    chatScroll: {
        flex: 1,
    },

    chatScrollContent: {
        paddingHorizontal: 12,
        paddingBottom: 24,
    },

    composerAreaOuter: {
        borderWidth: 1.5,
        borderColor: Color.border,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 10
    },

    composerArea: {
        paddingHorizontal: 12,
        paddingTop: 12,
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
    },

    textInputBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Color.border,
        borderRadius: 10,
        paddingHorizontal: 8,
        height: 44,
    },

    addTagButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 6,
    },

    tagPlaceholderText: {
        color: Color.placeholder,
        fontSize: 14,
        marginLeft: 3,
    },

    attachmentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingVertical: 5,
        paddingHorizontal: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E4E4E7',
        marginRight: 4,
        columnGap: 4,
    },

    chipThumbnail: {
        width: 14,
        height: 14,
        borderRadius: 2,
    },

    chipFileName: {
        fontSize: 13,
        color: '#475569',
    },

    messageTextInput: {
        flex: 1,
        height: 40,
        fontSize: 14,
        paddingHorizontal: 4,
        color: Color.black,
    },

    giftActionCircle: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#F5F3FF',
        borderWidth: 1,
        borderColor: '#5863DE',
        justifyContent: 'center',
        alignItems: 'center',
    },

    sendActionCircle: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#5863DE',
        justifyContent: 'center',
        alignItems: 'center',
    },

    composerMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },

    characterCounter: {
        fontSize: 14,
        color: '#64748B',
    },

    availableMeta: {
        fontSize: 14,
        color: '#64748B',
    },

    unlimitedMeta: {
        color: '#5863DE',
        fontWeight: '500',
    },

    bubbleWrapper: {
        marginBottom: 12,
    },

    alignLeft: {
        alignSelf: 'flex-start',
        marginLeft: 42,
    },

    alignRight: {
        alignSelf: 'flex-end',
    },

    avatarSpacer: {
        width: 34,
        marginRight: 8,
    },

    bubbleAvatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        marginRight: 8,
        marginBottom: 4,
    },

    bubbleCard: {
        maxWidth: '82%',
        borderRadius: 16,
        padding: 14,
    },

    incomingCard: {
        backgroundColor: '#F4F4F5',
    },

    outgoingCard: {
        maxWidth: '95%',
        backgroundColor: 'rgba(88, 99, 222, 0.15)',
    },

    bubbleText: {
        fontSize: 15.5,
        lineHeight: 20,
        paddingBottom: 4
    },

    incomingText: {
        color: '#18181B',
    },

    outgoingText: {
        color: '#18181B',
    },

    timeTag: {
        fontSize: 14,
    },

    timeLeft: {
        color: '#71717A',

    },

    timeRight: {
        color: '#71717A',

    },

    mediaCard: {
        backgroundColor: 'rgba(88, 99, 222, 0.15)',
        borderRadius: 16,
        overflow: 'hidden',
        width: Dimensions.get('window').width * 0.75,
        maxWidth: '100%',
    },

    mediaContainer: {
        margin: 12,
        height: 380,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: 10,
    },

    mediaCenterImage: {
        width: '65%',
        height: '100%',
    },

    playButtonCircle: {
        position: 'absolute',
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    mediaTextContainer: {
        padding: 14,
    },

    giftCard: {
        backgroundColor: 'rgba(88, 99, 222, 0.15)',
        borderRadius: 14,
        padding: 12,
        width: Dimensions.get('window').width * 0.75,
    },

    giftIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 8,
        backgroundColor: '#F5F3FF',
        borderWidth: 1,
        borderColor: Color.purple,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    dateSeparator: {
        textAlign: 'center',
        color: '#64748B',
        fontSize: 13,
        fontWeight: '500',
        marginVertical: 14,
    },

    bubbleRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 12,
    },

    rowNormal: {
        justifyContent: 'flex-start',
    },

    rowReverse: {
        justifyContent: 'flex-end',
    },
});

export default styles;